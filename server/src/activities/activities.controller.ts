import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';

@Controller()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('workspaces/:workspaceId/activities')
  @UseGuards(WorkspaceMemberGuard)
  async findAll(
    @Param('workspaceId') workspaceId: string,
    @Query('type') type?: string,
    @Query('actorId') actorId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.activitiesService.getTimeline(workspaceId, {
      type,
      actorId,
      limit,
    });
  }
}
