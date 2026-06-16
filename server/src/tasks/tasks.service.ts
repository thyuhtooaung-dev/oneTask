import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { ActivitiesService } from '../activities/activities.service';
import { EventType } from '../activities/entities/activity-event.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectsService } from '../projects/projects.service';
import { WorkspacePolicyService } from '../workspaces/workspace-policy.service';
import { WorkspaceAction } from '../workspaces/workspace-policy';
import { WorkspaceRole } from '../workspaces/entities/workspace-member.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly projectsService: ProjectsService,
    private readonly activitiesService: ActivitiesService,
    private readonly policyService: WorkspacePolicyService,
    private readonly notificationsService: NotificationsService,
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
    priority?: TaskPriority,
    dueDate?: string,
  ): Promise<Task> {
    await this.policyService.assertAction(
      reporterId,
      workspaceId,
      WorkspaceAction.MANAGE_TASKS,
    );

    // Verify project access
    const project = await this.projectsService.findOne(projectId, reporterId);

    if (project.workspaceId !== workspaceId) {
      throw new NotFoundException('Project not found in this workspace');
    }

    if (assigneeId) {
      await this.policyService.assertUserIsWorkspaceMember(
        assigneeId,
        workspaceId,
      );
    }

    const task = this.taskRepository.create({
      title,
      description,
      status: status || TaskStatus.TODO,
      workspaceId,
      projectId,
      reporterId,
      assigneeId,
      priority: priority || TaskPriority.NONE,
      dueDate: dueDate ? new Date(dueDate) : null,
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

    if (assigneeId && assigneeId !== reporterId) {
      await this.notificationsService.create({
        userId: assigneeId,
        workspaceId,
        type: 'task.assigned',
        payload: {
          taskId: savedTask.id,
          taskTitle: savedTask.title,
          assignerId: reporterId,
        },
      });
    }

    return savedTask;
  }

  /**
   * Lists all tasks belonging to the active workspace
   */
  async findAllForWorkspace(workspaceId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { workspaceId, archivedAt: IsNull() },
      relations: ['project', 'assignee', 'reporter'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Archives a task if it is in DONE state
   */
  async archive(
    id: string,
    actorId: string,
    workspaceId: string,
  ): Promise<Task> {
    const task = await this.findOne(id);

    if (task.workspaceId !== workspaceId) {
      throw new NotFoundException('Task not found in this workspace');
    }

    if (task.status !== TaskStatus.DONE) {
      throw new BadRequestException(
        'Only tasks in the DONE state can be archived.',
      );
    }

    // Role checks similar to update
    const role = await this.policyService.getMemberRole(actorId, workspaceId);
    const isReporter = task.reporterId === actorId;
    const isAssignee = task.assigneeId === actorId;

    if (role === WorkspaceRole.MEMBER && !isReporter && !isAssignee) {
      throw new ForbiddenException(
        'You do not have permission to archive this task',
      );
    }

    task.archivedAt = new Date();
    const savedTask = await this.taskRepository.save(task);

    await this.activitiesService.logEvent({
      workspaceId,
      actorId,
      type: EventType.TASK_UPDATED,
      entityType: 'task',
      entityId: savedTask.id,
      metadata: { taskTitle: savedTask.title, action: 'archived' },
    });

    return savedTask;
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
      priority?: TaskPriority;
      dueDate?: string | null;
    },
  ): Promise<Task> {
    const task = await this.findOne(id);

    await this.policyService.assertAction(
      actorId,
      task.workspaceId,
      WorkspaceAction.MANAGE_TASKS,
    );

    const role = await this.policyService.getMemberRole(
      actorId,
      task.workspaceId,
    );

    const isReporter = task.reporterId === actorId;
    const isAssignee = task.assigneeId === actorId;

    if (role === WorkspaceRole.MEMBER) {
      if (!isReporter && !isAssignee) {
        throw new ForbiddenException(
          'You can only edit tasks assigned to you or created by you',
        );
      }

      // If they are an assignee but not the reporter, they can't change title/description/assignee
      if (!isReporter && isAssignee) {
        if (body.title !== undefined && body.title !== task.title) {
          throw new ForbiddenException(
            'Only the creator can change the task title',
          );
        }
        if (
          body.description !== undefined &&
          (body.description || null) !== (task.description || null)
        ) {
          throw new ForbiddenException(
            'Only the creator can change the task description',
          );
        }
        if (
          body.assigneeId !== undefined &&
          (body.assigneeId || null) !== (task.assigneeId || null)
        ) {
          throw new ForbiddenException(
            'Only the creator can reassign the task',
          );
        }
      }
    }

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

    if (body.priority !== undefined && body.priority !== task.priority) {
      changes.priority = { from: task.priority, to: body.priority };
      task.priority = body.priority;
    }

    if (
      body.dueDate !== undefined &&
      (body.dueDate ? new Date(body.dueDate).toISOString() : null) !==
        (task.dueDate ? task.dueDate.toISOString() : null)
    ) {
      changes.dueDate = {
        from: task.dueDate ? task.dueDate.toISOString() : null,
        to: body.dueDate ? new Date(body.dueDate).toISOString() : null,
      };
      task.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }

    if (
      body.assigneeId !== undefined &&
      (body.assigneeId || null) !== (task.assigneeId || null)
    ) {
      if (body.assigneeId) {
        await this.policyService.assertUserIsWorkspaceMember(
          body.assigneeId,
          task.workspaceId,
        );
      }
      changes.assigneeId = {
        from: task.assigneeId || null,
        to: body.assigneeId || null,
      };
      task.assigneeId = body.assigneeId || null;
      delete task.assignee;
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

    if (
      changes.assigneeId &&
      changes.assigneeId.to &&
      changes.assigneeId.to !== changes.assigneeId.from &&
      changes.assigneeId.to !== actorId
    ) {
      await this.notificationsService.create({
        userId: changes.assigneeId.to as string,
        workspaceId: savedTask.workspaceId,
        type: 'task.assigned',
        payload: {
          taskId: savedTask.id,
          taskTitle: savedTask.title,
          assignerId: actorId,
        },
      });
    }

    if (changes.status && task.assigneeId && task.assigneeId !== actorId) {
      await this.notificationsService.create({
        userId: task.assigneeId,
        workspaceId: savedTask.workspaceId,
        type: 'task.status_changed',
        payload: {
          taskId: savedTask.id,
          taskTitle: savedTask.title,
          status: changes.status.to,
          changerId: actorId,
        },
      });
    }

    return this.findOne(savedTask.id);
  }

  async delete(id: string, actorId: string): Promise<{ deleted: true }> {
    const task = await this.findOne(id);

    await this.policyService.assertAction(
      actorId,
      task.workspaceId,
      WorkspaceAction.MANAGE_TASKS,
    );

    const role = await this.policyService.getMemberRole(
      actorId,
      task.workspaceId,
    );

    if (role === WorkspaceRole.MEMBER && task.reporterId !== actorId) {
      throw new ForbiddenException(
        'Only the creator or admins can delete this task',
      );
    }

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
