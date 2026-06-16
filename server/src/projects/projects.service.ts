import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { ActivitiesService } from '../activities/activities.service';
import { EventType } from '../activities/entities/activity-event.entity';
import { WorkspacePolicyService } from '../workspaces/workspace-policy.service';
import { WorkspaceAction } from '../workspaces/workspace-policy';
import { WorkspaceRole } from '../workspaces/entities/workspace-member.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
    private readonly activitiesService: ActivitiesService,
    private readonly policyService: WorkspacePolicyService,
  ) {}

  /**
   * Creates a new project inside the resolved workspace
   */
  async create(
    name: string,
    description: string | undefined,
    workspaceId: string,
    actorId: string,
    isPrivate?: boolean,
  ): Promise<Project> {
    await this.policyService.assertAction(
      actorId,
      workspaceId,
      WorkspaceAction.MANAGE_PROJECTS,
    );

    const project = this.projectRepository.create({
      name,
      description,
      workspaceId,
      isPrivate: isPrivate || false,
    });
    const savedProject = await this.projectRepository.save(project);

    if (savedProject.isPrivate) {
      await this.projectMemberRepository.save(
        this.projectMemberRepository.create({
          projectId: savedProject.id,
          userId: actorId,
        }),
      );
    }

    // Log activity event
    await this.activitiesService.logEvent({
      workspaceId,
      actorId,
      type: EventType.PROJECT_CREATED,
      entityType: 'project',
      entityId: savedProject.id,
      metadata: { projectName: savedProject.name },
    });

    return savedProject;
  }

  /**
   * Lists all projects that belong to the active workspace
   */
  async findAllForWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<Project[]> {
    const role = await this.policyService.getMemberRole(userId, workspaceId);
    if (role === WorkspaceRole.OWNER || role === WorkspaceRole.ADMIN) {
      return this.projectRepository.find({
        where: { workspaceId, archivedAt: IsNull() },
        order: { createdAt: 'DESC' },
      });
    }

    const projects = await this.projectRepository.find({
      where: { workspaceId, archivedAt: IsNull() },
      relations: ['members'],
      order: { createdAt: 'DESC' },
    });

    return projects.filter(
      (p) => !p.isPrivate || p.members.some((m) => m.userId === userId),
    );
  }

  /**
   * Retrieves a single project by ID
   */
  async findOne(id: string, userId?: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id, archivedAt: IsNull() },
      relations: ['members'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (userId && project.isPrivate) {
      const role = await this.policyService.getMemberRole(
        userId,
        project.workspaceId,
      );
      if (role !== WorkspaceRole.OWNER && role !== WorkspaceRole.ADMIN) {
        const isMember = project.members.some((m) => m.userId === userId);
        if (!isMember) {
          throw new NotFoundException('Project not found');
        }
      }
    }

    return project;
  }

  /**
   * Updates an existing project
   */
  async update(
    id: string,
    workspaceId: string,
    actorId: string,
    updateData: { name?: string; description?: string },
  ): Promise<Project> {
    await this.policyService.assertAction(
      actorId,
      workspaceId,
      WorkspaceAction.MANAGE_PROJECTS,
    );

    const project = await this.findOne(id);

    if (project.workspaceId !== workspaceId) {
      throw new NotFoundException('Project not found in this workspace');
    }

    const updated = await this.projectRepository.save({
      ...project,
      ...updateData,
    });

    // Log activity event
    await this.activitiesService.logEvent({
      workspaceId,
      actorId,
      type: EventType.PROJECT_UPDATED,
      entityType: 'project',
      entityId: updated.id,
      metadata: { projectName: updated.name },
    });

    return updated;
  }

  /**
   * Archives an existing project
   */
  async archive(
    id: string,
    workspaceId: string,
    actorId: string,
  ): Promise<Project> {
    await this.policyService.assertAction(
      actorId,
      workspaceId,
      WorkspaceAction.MANAGE_PROJECTS,
    );

    const project = await this.findOne(id);

    if (project.workspaceId !== workspaceId) {
      throw new NotFoundException('Project not found in this workspace');
    }

    project.archivedAt = new Date();
    const archived = await this.projectRepository.save(project);

    // Log activity event
    await this.activitiesService.logEvent({
      workspaceId,
      actorId,
      type: EventType.PROJECT_ARCHIVED,
      entityType: 'project',
      entityId: archived.id,
      metadata: { projectName: archived.name },
    });

    return archived;
  }
}
