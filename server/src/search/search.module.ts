import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEvent } from '../activities/entities/activity-event.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      Project,
      Comment,
      WorkspaceMember,
      ActivityEvent,
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService, WorkspaceMemberGuard],
  exports: [SearchService],
})
export class SearchModule {}
