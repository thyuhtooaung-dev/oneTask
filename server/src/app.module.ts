import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RawEvent } from './analytics/entities/raw-event.entity';
import { DailyEventMetric } from './analytics/entities/daily-event-metric.entity';
import { User } from './users/entities/user.entity';
import { Workspace } from './workspaces/entities/workspace.entity';
import { WorkspaceMember } from './workspaces/entities/workspace-member.entity';
import { WorkspaceInvite } from './workspaces/entities/workspace-invite.entity';
import { Project } from './projects/entities/project.entity';
import { Task } from './tasks/entities/task.entity';
import { Comment } from './comments/entities/comment.entity';
import { ActivityEvent } from './activities/entities/activity-event.entity';
import { Notification } from './notifications/entities/notification.entity';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ActivitiesModule } from './activities/activities.module';
import { SeedModule } from './seed/seed.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RealtimeModule } from './realtime/realtime.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // 100 requests per minute
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [
          RawEvent,
          DailyEventMetric,
          User,
          Workspace,
          WorkspaceMember,
          WorkspaceInvite,
          Project,
          Task,
          Comment,
          ActivityEvent,
          Notification,
        ],
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // Disabled in production; use migrations instead
        ssl:
          configService.get<string>('DATABASE_URL')?.includes('sslmode=') ||
          configService.get<string>('DATABASE_URL')?.includes('neon.tech')
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    ActivitiesModule,
    SeedModule,
    UsersModule,
    AuthModule,
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
    CommentsModule,
    RealtimeModule,
    NotificationsModule,
    AnalyticsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
