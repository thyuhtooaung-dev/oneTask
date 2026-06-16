import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { FileAttachment } from './entities/file-attachment.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileAttachment)
    private fileRepository: Repository<FileAttachment>,
  ) {}

  async create(data: Partial<FileAttachment>): Promise<FileAttachment> {
    const file = this.fileRepository.create(data);
    return this.fileRepository.save(file);
  }

  async findAllByProject(
    projectId: string,
    taskId?: string,
  ): Promise<FileAttachment[]> {
    const where: FindOptionsWhere<FileAttachment> = { projectId };
    if (taskId) where.taskId = taskId;

    return this.fileRepository.find({
      where,
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByTask(taskId: string): Promise<FileAttachment[]> {
    return this.fileRepository.find({
      where: { taskId },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, workspaceId: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id, workspaceId },
    });
    if (!file) throw new NotFoundException('File not found');

    // Delete from DB
    await this.fileRepository.remove(file);

    // Delete physical file
    const filePath = path.join(process.cwd(), 'uploads', file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
