import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { CommentAttachment } from './entities/comment.entity';

interface CommentBody {
  content?: string;
  attachments?: CommentAttachment[];
}

@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(WorkspaceMemberGuard)
  async create(
    @Param('taskId') taskId: string,
    @Body() body: CommentBody,
    @CurrentUser() user: { id: string },
  ) {
    return this.commentsService.create(
      body.content,
      taskId,
      user.id,
      body.attachments,
    );
  }

  @Get()
  @UseGuards(WorkspaceMemberGuard)
  async findAll(@Param('taskId') taskId: string) {
    return this.commentsService.findAllForTask(taskId);
  }

  @Patch(':commentId')
  @UseGuards(WorkspaceMemberGuard)
  async update(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Body() body: CommentBody,
    @CurrentUser() user: { id: string },
  ) {
    return this.commentsService.update(
      commentId,
      taskId,
      user.id,
      body.content,
      body.attachments,
    );
  }

  @Delete(':commentId')
  @UseGuards(WorkspaceMemberGuard)
  async delete(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.commentsService.delete(commentId, taskId, user.id);
    return { success: true };
  }
}
