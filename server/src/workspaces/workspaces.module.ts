import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { WorkspaceInvite } from './entities/workspace-invite.entity';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { WorkspaceMemberGuard } from './guards/workspace-member.guard';
import { ActivitiesModule } from '../activities/activities.module';
import { WorkspacePolicyService } from './workspace-policy.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workspace,
      WorkspaceMember,
      WorkspaceInvite,
      Project,
      Task,
    ]),
    ActivitiesModule,
    RealtimeModule,
    MailModule,
    NotificationsModule,
  ],
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceMemberGuard, WorkspacePolicyService],
  exports: [
    WorkspacesService,
    WorkspaceMemberGuard,
    WorkspacePolicyService,
    TypeOrmModule,
  ],
})
export class WorkspacesModule {}
