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
      dest: './uploads',
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size
      },
    }),
    RealtimeModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
