import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { WorkspaceMemberGuard } from '../workspaces/guards/workspace-member.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('workspaces/:workspaceId/projects/:projectId/files')
@UseGuards(WorkspaceMemberGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string },
    @Body('folder') folder: string = '/',
    @Body('taskId') taskId?: string,
    @Body('commentId') commentId?: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    return this.filesService.create({
      workspaceId,
      projectId,
      taskId,
      commentId,
      folder,
      uploaderId: user.id,
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    });
  }

  @Get()
  async getProjectFiles(
    @Param('projectId') projectId: string,
    @Query('taskId') taskId?: string,
  ) {
    return this.filesService.findAllByProject(projectId, taskId);
  }

  @Delete(':fileId')
  async deleteFile(
    @Param('workspaceId') workspaceId: string,
    @Param('fileId') fileId: string,
  ) {
    await this.filesService.remove(fileId, workspaceId);
    return { success: true };
  }
}
