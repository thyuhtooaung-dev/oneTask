import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { FileAttachment } from './entities/file-attachment.entity';
import { RealtimeModule } from '../realtime/realtime.module';
import { WorkspaceMember } from '../workspaces/entities/workspace-member.entity';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileAttachment, WorkspaceMember, Project, Task]),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
    RealtimeModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
