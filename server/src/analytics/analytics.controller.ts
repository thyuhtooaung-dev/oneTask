import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';

@Controller('workspaces/:workspaceId/analytics')
@UseGuards(WorkspaceMemberGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('insights')
  async getInsights(@Param('workspaceId') workspaceId: string) {
    return this.analyticsService.getWorkspaceInsights(workspaceId);
  }
}
