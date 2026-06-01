import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentAttachment } from './entities/comment.entity';
import { Task } from '../tasks/entities/task.entity';
import { ActivitiesService } from '../activities/activities.service';
import { EventType } from '../activities/entities/activity-event.entity';
import { WorkspacePolicyService } from '../workspaces/workspace-policy.service';
import { WorkspaceAction } from '../workspaces/workspace-policy';
import { NotificationsService } from '../notifications/notifications.service';

const MAX_COMMENT_ATTACHMENTS = 4;
const MAX_ATTACHMENT_DATA_URL_BYTES = 2 * 1024 * 1024;
const SUPPORTED_IMAGE_DATA_URL = /^data:image\/(png|jpe?g|webp|gif);base64,/i;

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly activitiesService: ActivitiesService,
    private readonly policyService: WorkspacePolicyService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Adds a new comment to a task
   */
  async create(
    content: string | undefined,
    taskId: string,
    authorId: string,
    attachments?: CommentAttachment[],
  ): Promise<Comment> {
    const cleanContent = content?.trim();
    const cleanAttachments = this.validateAttachments(attachments);
    if (!cleanContent && cleanAttachments.length === 0) {
      throw new BadRequestException('Comment content or image is required');
    }

    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.policyService.assertAction(
      authorId,
      task.workspaceId,
      WorkspaceAction.COMMENT,
    );

    const comment = this.commentRepository.create({
      content: cleanContent || '',
      attachments: cleanAttachments.length > 0 ? cleanAttachments : null,
      taskId,
      authorId,
    });
    const savedComment = await this.commentRepository.save(comment);

    await this.activitiesService.logEvent({
      workspaceId: task.workspaceId,
      actorId: authorId,
      type: EventType.COMMENT_CREATED,
      entityType: 'comment',
      entityId: savedComment.id,
      metadata: {
        taskId,
        commentPreview:
          cleanContent?.substring(0, 100) ||
          `${cleanAttachments.length} image attachment${
            cleanAttachments.length === 1 ? '' : 's'
          }`,
      },
    });

    if (task.assigneeId && task.assigneeId !== authorId) {
      await this.notificationsService.create({
        userId: task.assigneeId,
        workspaceId: task.workspaceId,
        type: 'task.commented',
        payload: {
          taskId: task.id,
          taskTitle: task.title,
          commentAuthorId: authorId,
        },
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

  async update(
    commentId: string,
    taskId: string,
    userId: string,
    content: string | undefined,
    attachments?: CommentAttachment[],
  ): Promise<Comment> {
    const cleanContent = content?.trim();

    const comment = await this.commentRepository.findOne({
      where: { id: commentId, taskId },
      relations: ['task'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.policyService.assertAction(
      userId,
      comment.task.workspaceId,
      WorkspaceAction.COMMENT,
    );

    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        'Only the comment author can edit this comment',
      );
    }

    const nextAttachments =
      attachments === undefined
        ? comment.attachments || []
        : this.validateAttachments(attachments);

    if (!cleanContent && nextAttachments.length === 0) {
      throw new BadRequestException('Comment content or image is required');
    }

    comment.content = cleanContent || '';
    comment.attachments = nextAttachments.length > 0 ? nextAttachments : null;
    await this.commentRepository.save(comment);

    return this.commentRepository.findOne({
      where: { id: comment.id },
      relations: ['author'],
    }) as Promise<Comment>;
  }

  async delete(
    commentId: string,
    taskId: string,
    userId: string,
  ): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, taskId },
      relations: ['task'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.policyService.assertAction(
      userId,
      comment.task.workspaceId,
      WorkspaceAction.COMMENT,
    );

    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        'Only the comment author can delete this comment',
      );
    }

    await this.commentRepository.delete(comment.id);
  }

  private validateAttachments(
    attachments?: CommentAttachment[],
  ): CommentAttachment[] {
    if (!attachments) return [];
    if (!Array.isArray(attachments)) {
      throw new BadRequestException('Comment attachments must be an array');
    }
    if (attachments.length > MAX_COMMENT_ATTACHMENTS) {
      throw new BadRequestException(
        `A comment can include up to ${MAX_COMMENT_ATTACHMENTS} images`,
      );
    }

    return attachments.map((attachment) => {
      const name = attachment?.name?.trim() || 'image';
      const type = attachment?.type?.trim();
      const dataUrl = attachment?.dataUrl?.trim();
      const size = Number(attachment?.size || 0);

      if (!type?.startsWith('image/') || !dataUrl) {
        throw new BadRequestException('Only image attachments are supported');
      }

      if (!SUPPORTED_IMAGE_DATA_URL.test(dataUrl)) {
        throw new BadRequestException(
          'Image attachment must be a base64 data URL',
        );
      }

      if (
        size > MAX_ATTACHMENT_DATA_URL_BYTES ||
        Buffer.byteLength(dataUrl, 'utf8') > MAX_ATTACHMENT_DATA_URL_BYTES
      ) {
        throw new BadRequestException('Each image must be 2MB or smaller');
      }

      return { name, type, size, dataUrl };
    });
  }
}
