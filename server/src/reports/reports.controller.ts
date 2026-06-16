import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('workspaces/:workspaceId/reports')
  @UseGuards(WorkspaceMemberGuard)
  async submitReport(
    @Param('workspaceId') workspaceId: string,
    @Body()
    body: {
      completedWork: string;
      nextPlans: string;
      blockers?: string | null;
      reportDate?: string;
    },
    @CurrentUser() user: { id: string },
  ) {
    const authorId = user.id;
    const reportDate =
      body.reportDate || new Date().toISOString().split('T')[0];

    return this.reportsService.submitReport({
      workspaceId,
      authorId,
      reportDate,
      completedWork: body.completedWork,
      nextPlans: body.nextPlans,
      blockers: body.blockers,
    });
  }

  @Get('workspaces/:workspaceId/reports')
  @UseGuards(WorkspaceMemberGuard)
  async getReports(
    @Param('workspaceId') workspaceId: string,
    @Query('date') date?: string,
    @Query('authorId') authorId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.reportsService.getReports(workspaceId, {
      date,
      authorId,
      limit,
    });
  }

  @Get('workspaces/:workspaceId/reports/summary')
  @UseGuards(WorkspaceMemberGuard)
  async getReportSummary(@Param('workspaceId') workspaceId: string) {
    return this.reportsService.getReportSummary(workspaceId);
  }
}
