import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RawEvent } from './analytics/entities/raw-event.entity';
import { DailyEventMetric } from './analytics/entities/daily-event-metric.entity';
import { User } from './users/entities/user.entity';
import { Workspace } from './workspaces/entities/workspace.entity';
import { WorkspaceMember } from './workspaces/entities/workspace-member.entity';
import { Project } from './projects/entities/project.entity';
import { Task } from './tasks/entities/task.entity';
import { Comment } from './comments/entities/comment.entity';
import { ActivityEvent } from './activities/entities/activity-event.entity';
import { Notification } from './notifications/entities/notification.entity';
import { APP_GUARD } from '@nestjs/core';
import { ActivitiesModule } from './activities/activities.module';
import { SeedModule } from './seed/seed.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [
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
          Project,
          Task,
          Comment,
          ActivityEvent,
          Notification,
        ],
        synchronize: true, // Use only for MVP/dev. Use migrations for production!
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
