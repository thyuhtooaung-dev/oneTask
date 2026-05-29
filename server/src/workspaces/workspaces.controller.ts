import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  Patch,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WorkspaceMemberGuard } from './guards/workspace-member.guard';
import { WorkspaceRoleGuard } from './guards/workspace-role.guard';
import { Roles } from './decorators/workspace-roles.decorator';
import { WorkspaceRole } from './entities/workspace-member.entity';
import { Public } from '../auth/decorators/public.decorator';
import { CreateWorkspaceDto } from '../common/dto/create-workspace.dto';
import { CreateInviteDto } from '../common/dto/create-invite.dto';
import { UpdateMemberRoleDto } from '../common/dto/update-member-role.dto';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  async create(
    @Body() body: CreateWorkspaceDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.workspacesService.create(body.name, body.description, user.id);
  }

  @Get()
  async findAll(@CurrentUser() user: { id: string }) {
    return this.workspacesService.findAllForUser(user.id);
  }

  // --- PUBLIC INVITE ROUTES ---
  @Public()
  @Get('invites/:token')
  async getInviteMetadata(@Param('token') token: string) {
    return this.workspacesService.getInviteMetadata(token);
  }

  @Post('invites/:token/accept')
  async acceptInvite(
    @Param('token') token: string,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.workspacesService.acceptInvite(token, user);
  }

  // --- WORKSPACE ROUTES ---
  @Get(':workspaceId')
  @UseGuards(WorkspaceMemberGuard)
  async findOne(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.findOne(workspaceId);
  }

  @Get(':workspaceId/invites')
  @UseGuards(WorkspaceMemberGuard, WorkspaceRoleGuard)
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  async getInvites(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.getInvites(workspaceId);
  }

  @Post(':workspaceId/invites')
  @UseGuards(WorkspaceMemberGuard, WorkspaceRoleGuard)
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  async createInvite(
    @Param('workspaceId') workspaceId: string,
    @Body() body: CreateInviteDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.workspacesService.createInvite(
      workspaceId,
      body.email,
      body.role,
      user.id,
    );
  }

  @Delete(':workspaceId/invites/:inviteId')
  @UseGuards(WorkspaceMemberGuard, WorkspaceRoleGuard)
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  async revokeInvite(
    @Param('workspaceId') workspaceId: string,
    @Param('inviteId') inviteId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.workspacesService.revokeInvite(workspaceId, inviteId, user.id);
  }

  @Patch(':workspaceId/members/:memberId')
  @UseGuards(WorkspaceMemberGuard, WorkspaceRoleGuard)
  @Roles(WorkspaceRole.OWNER)
  async updateMemberRole(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() body: UpdateMemberRoleDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.workspacesService.updateMemberRole(
      workspaceId,
      memberId,
      body.role,
      user.id,
    );
  }

  @Delete(':workspaceId/members/:memberId')
  @UseGuards(WorkspaceMemberGuard, WorkspaceRoleGuard)
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  async removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.workspacesService.removeMember(workspaceId, memberId, user.id);
  }
}
