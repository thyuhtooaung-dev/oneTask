import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { ActivitiesService } from '../activities/activities.service';
import { EventType } from '../activities/entities/activity-event.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly activitiesService: ActivitiesService,
  ) {}

  /**
   * Creates a new task inside the workspace and project
   */
  async create(
    title: string,
    description: string | undefined,
    status: TaskStatus | undefined,
    workspaceId: string,
    projectId: string,
    reporterId: string,
    assigneeId?: string,
  ): Promise<Task> {
    const task = this.taskRepository.create({
      title,
      description,
      status: status || TaskStatus.TODO,
      workspaceId,
      projectId,
      reporterId,
      assigneeId,
    });
    const savedTask = await this.taskRepository.save(task);

    // Log activity event
    await this.activitiesService.logEvent({
      workspaceId,
      actorId: reporterId,
      type: EventType.TASK_CREATED,
      entityType: 'task',
      entityId: savedTask.id,
      metadata: { taskTitle: savedTask.title },
    });

    return savedTask;
  }

  /**
   * Lists all tasks belonging to the active workspace
   */
  async findAllForWorkspace(workspaceId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { workspaceId },
      relations: ['project', 'assignee', 'reporter'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Retrieves task details by ID
   */
  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: [
        'project',
        'assignee',
        'reporter',
        'comments',
        'comments.author',
      ],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }
}
