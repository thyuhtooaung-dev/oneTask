import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import {
  WorkspaceMember,
  WorkspaceRole,
} from './entities/workspace-member.entity';
import { ActivitiesService } from '../activities/activities.service';
import { EventType } from '../activities/entities/activity-event.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    private readonly activitiesService: ActivitiesService,
  ) {}

  /**
   * Creates a new workspace and registers the creator as the Owner
   */
  async create(
    name: string,
    description: string | undefined,
    userId: string,
  ): Promise<Workspace> {
    // 1. Create and save the workspace
    const workspace = this.workspaceRepository.create({
      name,
      description,
      ownerId: userId,
    });
    const savedWorkspace = await this.workspaceRepository.save(workspace);

    // 2. Add the creator as the Owner member of this workspace
    const membership = this.workspaceMemberRepository.create({
      workspaceId: savedWorkspace.id,
      userId,
      role: WorkspaceRole.OWNER,
    });
    await this.workspaceMemberRepository.save(membership);

    // 3. Log activity event
    await this.activitiesService.logEvent({
      workspaceId: savedWorkspace.id,
      actorId: userId,
      type: EventType.WORKSPACE_CREATED,
      entityType: 'workspace',
      entityId: savedWorkspace.id,
      metadata: { workspaceName: savedWorkspace.name },
    });

    return savedWorkspace;
  }

  /**
   * Retrieves a single workspace by ID
   */
  async findOne(id: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      relations: ['members', 'members.user'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  /**
   * Lists all workspaces where the given user is a member
   */
  async findAllForUser(userId: string): Promise<Workspace[]> {
    const memberships = await this.workspaceMemberRepository.find({
      where: { userId },
      relations: ['workspace'],
    });

    return memberships.map((membership) => membership.workspace);
  }
}
