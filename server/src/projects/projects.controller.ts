import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateProjectDto } from '../common/dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Patch } from '@nestjs/common';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('workspaces/:workspaceId/projects')
  @UseGuards(WorkspaceMemberGuard)
  async create(
    @Param('workspaceId') workspaceId: string,
    @Body() body: CreateProjectDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.create(
      body.name,
      body.description,
      workspaceId,
      user.id,
      body.isPrivate,
    );
  }

  @Get('workspaces/:workspaceId/projects')
  @UseGuards(WorkspaceMemberGuard)
  async findAll(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.findAllForWorkspace(workspaceId, user.id);
  }

  @Get('projects/:projectId')
  @UseGuards(WorkspaceMemberGuard)
  async findOne(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.findOne(projectId, user.id);
  }

  @Patch('workspaces/:workspaceId/projects/:projectId')
  @UseGuards(WorkspaceMemberGuard)
  async update(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() body: UpdateProjectDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.update(projectId, workspaceId, user.id, body);
  }

  @Post('workspaces/:workspaceId/projects/:projectId/archive')
  @UseGuards(WorkspaceMemberGuard)
  async archive(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.archive(projectId, workspaceId, user.id);
  }
}
