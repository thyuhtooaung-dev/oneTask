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

  async update(
    id: string,
    actorId: string,
    body: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      assigneeId?: string | null;
    },
  ): Promise<Task> {
    const task = await this.findOne(id);
    const changes: Record<string, { from: unknown; to: unknown }> = {};

    if (body.title !== undefined && body.title !== task.title) {
      changes.title = { from: task.title, to: body.title };
      task.title = body.title;
    }

    if (
      body.description !== undefined &&
      (body.description || null) !== (task.description || null)
    ) {
      changes.description = {
        from: task.description || null,
        to: body.description || null,
      };
      task.description = body.description || null;
    }

    if (body.status !== undefined && body.status !== task.status) {
      changes.status = { from: task.status, to: body.status };
      task.status = body.status;
    }

    if (
      body.assigneeId !== undefined &&
      (body.assigneeId || null) !== (task.assigneeId || null)
    ) {
      changes.assigneeId = {
        from: task.assigneeId || null,
        to: body.assigneeId || null,
      };
      task.assigneeId = body.assigneeId || null;
    }

    const savedTask = await this.taskRepository.save(task);

    if (Object.keys(changes).length > 0) {
      await this.activitiesService.logEvent({
        workspaceId: savedTask.workspaceId,
        actorId,
        type: EventType.TASK_UPDATED,
        entityType: 'task',
        entityId: savedTask.id,
        metadata: {
          taskTitle: savedTask.title,
          changes,
        },
      });
    }

    return this.findOne(savedTask.id);
  }

  async delete(id: string, actorId: string): Promise<{ deleted: true }> {
    const task = await this.findOne(id);

    await this.taskRepository.remove(task);

    await this.activitiesService.logEvent({
      workspaceId: task.workspaceId,
      actorId,
      type: EventType.TASK_DELETED,
      entityType: 'task',
      entityId: id,
      metadata: { taskTitle: task.title },
    });

    return { deleted: true };
  }
}
