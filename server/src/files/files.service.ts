import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { FileAttachment } from './entities/file-attachment.entity';
import { createClient } from '@supabase/supabase-js';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  private supabase: ReturnType<typeof createClient>;
  private bucketName: string;

  constructor(
    @InjectRepository(FileAttachment)
    private fileRepository: Repository<FileAttachment>,
    private configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL') ||
        'https://placeholder.supabase.co',
      this.configService.get<string>('SUPABASE_KEY') || 'placeholder-key',
    );
    this.bucketName =
      this.configService.get<string>('SUPABASE_BUCKET') || 'attachments';
  }

  async create(
    data: Partial<FileAttachment>,
    fileBuffer?: Buffer,
  ): Promise<FileAttachment> {
    if (fileBuffer) {
      const folderPath = `workspaces/${data.workspaceId}/projects/${data.projectId}${data.folder !== '/' ? data.folder : ''}`;
      const filePath = `${folderPath}/${data.filename}`;

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, fileBuffer, {
          contentType: data.mimetype,
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new InternalServerErrorException(
          `Supabase upload failed: ${error.message}`,
        );
      }

      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      data.fileUrl = publicUrlData.publicUrl;
      data.filePath = filePath;
    }

    const file = this.fileRepository.create(data);
    try {
      return await this.fileRepository.save(file);
    } catch (e) {
      if (data.filePath) {
        // Attempt to clean up orphaned Supabase file silently
        await this.supabase.storage
          .from(this.bucketName)
          .remove([data.filePath]);
      }
      throw e;
    }
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

  async findOne(id: string, workspaceId: string): Promise<FileAttachment> {
    const file = await this.fileRepository.findOne({
      where: { id, workspaceId },
    });
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async remove(id: string, workspaceId: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id, workspaceId },
    });
    if (!file) throw new NotFoundException('File not found');

    // Delete from DB first
    await this.fileRepository.remove(file);

    // Delete from Supabase if exists
    if (file.filePath) {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([file.filePath]);

      if (error) {
        console.warn(
          `Supabase remove returned error for filePath="${file.filePath}": ${error.message}`,
        );
      }
    }
  }
}
