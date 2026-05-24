import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEvent } from './entities/activity-event.entity';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityEvent, WorkspaceMember, Project, Task]),
    RealtimeModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, WorkspaceMemberGuard],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
