import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { SearchService } from './search.service';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('workspaces/:workspaceId/search')
  @UseGuards(WorkspaceMemberGuard)
  async searchWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Query('q') query?: string,
    @Query('limit') limit?: number,
  ) {
    return this.searchService.searchWorkspace(workspaceId, query, limit);
  }
}
