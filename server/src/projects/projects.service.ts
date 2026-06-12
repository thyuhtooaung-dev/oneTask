import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Project } from './entities/project.entity';
import { ActivitiesService } from '../activities/activities.service';
import { EventType } from '../activities/entities/activity-event.entity';
import { WorkspacePolicyService } from '../workspaces/workspace-policy.service';
import { WorkspaceAction } from '../workspaces/workspace-policy';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
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
    });
    const savedProject = await this.projectRepository.save(project);

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
  async findAllForWorkspace(workspaceId: string): Promise<Project[]> {
    return this.projectRepository.find({
      where: { workspaceId, archivedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Retrieves a single project by ID
   */
  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id, archivedAt: IsNull() },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
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
