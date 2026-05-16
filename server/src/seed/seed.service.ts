import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { Project } from '../projects/entities/project.entity';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import {
  WorkspaceMember,
  WorkspaceRole,
} from '../workspaces/entities/workspace-member.entity';
import { ActivitiesService } from '../activities/activities.service';
import { EventType } from '../activities/entities/activity-event.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(WorkspaceMember)
    private readonly memberRepo: Repository<WorkspaceMember>,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async onApplicationBootstrap() {
    const userCount = await this.userRepo.count();
    if (userCount > 0) {
      this.logger.log('Database already seeded. Skipping...');
      return;
    }

    this.logger.log('Seeding initial data...');

    // 1. Create a Demo User
    const user = await this.userRepo.save(
      this.userRepo.create({
        email: 'demo@example.com',
        password: 'demo123',
        name: 'Demo User',
      }),
    );

    // 2. Create a Workspace
    const workspace = await this.workspaceRepo.save(
      this.workspaceRepo.create({
        name: 'My Startup',
        ownerId: user.id,
      }),
    );

    // 3. Add User as Owner to Workspace
    await this.memberRepo.save(
      this.memberRepo.create({
        workspaceId: workspace.id,
        userId: user.id,
        role: WorkspaceRole.OWNER,
      }),
    );

    // 4. Create a Project
    const project = await this.projectRepo.save(
      this.projectRepo.create({
        name: 'MVP Launch',
        workspaceId: workspace.id,
      }),
    );

    // 5. Create some Tasks
    const task1 = await this.taskRepo.save(
      this.taskRepo.create({
        title: 'Setup Database',
        workspaceId: workspace.id,
        projectId: project.id,
        status: TaskStatus.DONE,
        reporterId: user.id,
        assigneeId: user.id,
      }),
    );

    const task2 = await this.taskRepo.save(
      this.taskRepo.create({
        title: 'Build UI Components',
        workspaceId: workspace.id,
        projectId: project.id,
        status: TaskStatus.IN_PROGRESS,
        reporterId: user.id,
      }),
    );

    // 6. Log some Activity Events
    await this.activitiesService.logEvent({
      workspaceId: workspace.id,
      actorId: user.id,
      type: EventType.MEMBER_JOINED,
      entityType: 'user',
      entityId: user.id,
    });

    await this.activitiesService.logEvent({
      workspaceId: workspace.id,
      actorId: user.id,
      type: EventType.TASK_CREATED,
      entityType: 'task',
      entityId: task1.id,
      metadata: { taskTitle: task1.title },
    });

    this.logger.log('Seeding completed successfully!');
  }
}
