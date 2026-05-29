import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Retrieves a single project by ID
   */
  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }
}
