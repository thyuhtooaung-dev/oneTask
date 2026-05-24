import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';

@Controller()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('workspaces/:workspaceId/activities')
  @UseGuards(WorkspaceMemberGuard)
  async findAll(@Param('workspaceId') workspaceId: string) {
    return this.activitiesService.getTimeline(workspaceId);
  }
}
