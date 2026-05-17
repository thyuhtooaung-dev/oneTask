import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Task } from '../tasks/entities/task.entity';
import { ActivitiesService } from '../activities/activities.service';
import { EventType } from '../activities/entities/activity-event.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly activitiesService: ActivitiesService,
  ) {}

  /**
   * Adds a new comment to a task
   */
  async create(
    content: string,
    taskId: string,
    authorId: string,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      content,
      taskId,
      authorId,
    });
    const savedComment = await this.commentRepository.save(comment);

    // Look up parent task to resolve the workspace context
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });
    if (task) {
      await this.activitiesService.logEvent({
        workspaceId: task.workspaceId,
        actorId: authorId,
        type: EventType.COMMENT_CREATED,
        entityType: 'comment',
        entityId: savedComment.id,
        metadata: { taskId, commentPreview: content.substring(0, 100) },
      });
    }

    // Retrieve full author details to display cleanly
    return this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['author'],
    }) as Promise<Comment>;
  }

  /**
   * Retrieves all comments for a specific task
   */
  async findAllForTask(taskId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { taskId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }
}
