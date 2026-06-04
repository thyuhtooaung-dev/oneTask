import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ActivitiesModule } from '../activities/activities.module';
import { TasksModule } from '../tasks/tasks.module';

import { NotificationsModule } from '../notifications/notifications.module';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, WorkspaceMember]),
    WorkspacesModule,
    ActivitiesModule,
    TasksModule,
    NotificationsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService, TypeOrmModule],
})
export class CommentsModule {}
