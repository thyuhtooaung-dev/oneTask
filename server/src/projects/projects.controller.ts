import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateProjectDto } from '../common/dto/create-project.dto';

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
    );
  }

  @Get('workspaces/:workspaceId/projects')
  @UseGuards(WorkspaceMemberGuard)
  async findAll(@Param('workspaceId') workspaceId: string) {
    return this.projectsService.findAllForWorkspace(workspaceId);
  }

  @Get('projects/:projectId')
  @UseGuards(WorkspaceMemberGuard)
  async findOne(@Param('projectId') projectId: string) {
    return this.projectsService.findOne(projectId);
  }
}
