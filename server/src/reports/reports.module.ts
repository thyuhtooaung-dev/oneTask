import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyReport } from './entities/daily-report.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';
import { Task } from '../tasks/entities/task.entity';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { RealtimeModule } from '../realtime/realtime.module';

import { Project } from '../projects/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyReport, WorkspaceMember, Task, Project]),
    RealtimeModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, WorkspaceMemberGuard],
  exports: [ReportsService],
})
export class ReportsModule {}
