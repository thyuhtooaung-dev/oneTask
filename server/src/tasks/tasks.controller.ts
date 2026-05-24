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
import { TasksService } from './tasks.service';
import { TaskStatus } from './entities/task.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('workspaces/:workspaceId/tasks')
  @UseGuards(WorkspaceMemberGuard)
  async create(
    @Param('workspaceId') workspaceId: string,
    @Body()
    body: {
      title: string;
      description?: string;
      status?: TaskStatus;
      projectId: string;
      assigneeId?: string;
    },
    @CurrentUser() user: { id: string },
  ) {
    return this.tasksService.create(
      body.title,
      body.description,
      body.status,
      workspaceId,
      body.projectId,
      user.id,
      body.assigneeId,
    );
  }

  @Get('workspaces/:workspaceId/tasks')
  @UseGuards(WorkspaceMemberGuard)
  async findAll(@Param('workspaceId') workspaceId: string) {
    return this.tasksService.findAllForWorkspace(workspaceId);
  }

  @Get('tasks/:taskId')
  @UseGuards(WorkspaceMemberGuard)
  async findOne(@Param('taskId') taskId: string) {
    return this.tasksService.findOne(taskId);
  }

  @Patch('tasks/:taskId')
  @UseGuards(WorkspaceMemberGuard)
  async update(
    @Param('taskId') taskId: string,
    @Body()
    body: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      assigneeId?: string | null;
    },
    @CurrentUser() user: { id: string },
  ) {
    return this.tasksService.update(taskId, user.id, body);
  }

  @Delete('tasks/:taskId')
  @UseGuards(WorkspaceMemberGuard)
  async delete(
    @Param('taskId') taskId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.tasksService.delete(taskId, user.id);
  }
}
