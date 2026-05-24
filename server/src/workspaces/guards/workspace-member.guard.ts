import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { Project } from '../../projects/entities/project.entity';
import { Task } from '../../tasks/entities/task.entity';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  workspaceMember?: WorkspaceMember;
}

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user; // Set globally by AuthGuard

    if (!user || !user.id) {
      throw new ForbiddenException('User is not authenticated');
    }

    const params = request.params as {
      workspaceId?: string;
      id?: string;
      projectId?: string;
      taskId?: string;
    };

    let workspaceId = params.workspaceId;

    // Support standard resource ID on the workspace controller itself (e.g. GET /workspaces/:id)
    const route = request.route as { path?: string } | undefined;
    if (!workspaceId && params.id && route?.path?.includes('/workspaces/:id')) {
      workspaceId = params.id;
    }

    // Resolve workspace context if a Project ID is present in URL
    if (!workspaceId && params.projectId) {
      const project = await this.projectRepository.findOne({
        where: { id: params.projectId },
      });
      if (!project) {
        throw new NotFoundException('Project not found');
      }
      workspaceId = project.workspaceId;
    }

    // Resolve workspace context if a Task ID is present in URL
    if (!workspaceId && params.taskId) {
      const task = await this.taskRepository.findOne({
        where: { id: params.taskId },
      });
      if (!task) {
        throw new NotFoundException('Task not found');
      }
      workspaceId = task.workspaceId;
    }

    // Fallback to body or query parameters
    if (!workspaceId) {
      const body = request.body as { workspaceId?: string } | undefined;
      const query = request.query as { workspaceId?: string } | undefined;
      workspaceId = body?.workspaceId || query?.workspaceId;
    }

    if (!workspaceId) {
      throw new ForbiddenException('Workspace context is required');
    }

    // Query membership in the TypeORM table
    const membership = await this.workspaceMemberRepository.findOne({
      where: {
        workspaceId,
        userId: user.id,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    // Attach membership for downstream controllers (useful for role checking!)
    Object.assign(request, { workspaceMember: membership });

    return true;
  }
}
