import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';

@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(WorkspaceMemberGuard)
  async create(
    @Param('taskId') taskId: string,
    @Body() body: { content: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.commentsService.create(body.content, taskId, user.id);
  }

  @Get()
  @UseGuards(WorkspaceMemberGuard)
  async findAll(@Param('taskId') taskId: string) {
    return this.commentsService.findAllForTask(taskId);
  }
}
