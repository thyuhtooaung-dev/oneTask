import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import {
  WorkspaceMember,
  WorkspaceRole,
} from './entities/workspace-member.entity';
import { WorkspaceInvite } from './entities/workspace-invite.entity';
import { ActivitiesService } from '../activities/activities.service';
import { EventType } from '../activities/entities/activity-event.entity';
import { WorkspacePolicyService } from './workspace-policy.service';
import { WorkspaceAction } from './workspace-policy';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { randomUUID } from 'crypto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(WorkspaceInvite)
    private readonly workspaceInviteRepository: Repository<WorkspaceInvite>,
    private readonly activitiesService: ActivitiesService,
    private readonly policyService: WorkspacePolicyService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Creates a new workspace and registers the creator as the Owner
   */
  async create(
    name: string,
    description: string | undefined,
    userId: string,
  ): Promise<Workspace> {
    // 1. Create and save the workspace
    const workspace = this.workspaceRepository.create({
      name,
      description,
      ownerId: userId,
    });
    const savedWorkspace = await this.workspaceRepository.save(workspace);

    // 2. Add the creator as the Owner member of this workspace
    const membership = this.workspaceMemberRepository.create({
      workspaceId: savedWorkspace.id,
      userId,
      role: WorkspaceRole.OWNER,
    });
    await this.workspaceMemberRepository.save(membership);

    // 3. Log activity event
    await this.activitiesService.logEvent({
      workspaceId: savedWorkspace.id,
      actorId: userId,
      type: EventType.WORKSPACE_CREATED,
      entityType: 'workspace',
      entityId: savedWorkspace.id,
      metadata: { workspaceName: savedWorkspace.name },
    });

    return savedWorkspace;
  }

  /**
   * Retrieves a single workspace by ID
   */
  async findOne(id: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      relations: ['members', 'members.user'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  /**
   * Lists all workspaces where the given user is a member
   */
  async findAllForUser(userId: string): Promise<Workspace[]> {
    const memberships = await this.workspaceMemberRepository.find({
      where: { userId },
      relations: ['workspace'],
    });

    return memberships.map((membership) => membership.workspace);
  }

  async createInvite(
    workspaceId: string,
    email: string,
    role: WorkspaceRole,
    createdBy: string,
  ) {
    await this.policyService.assertAction(
      createdBy,
      workspaceId,
      WorkspaceAction.MANAGE_MEMBERS,
    );

    const creator = await this.policyService.assertUserIsWorkspaceMember(
      createdBy,
      workspaceId,
    );
    if (creator.role === WorkspaceRole.ADMIN && role === WorkspaceRole.OWNER) {
      throw new ForbiddenException('Admins cannot invite owners');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2); // 2 days expiration

    const invite = this.workspaceInviteRepository.create({
      workspaceId,
      email,
      role,
      token: randomUUID(),
      createdBy,
      expiresAt,
    });

    const savedInvite = await this.workspaceInviteRepository.save(invite);

    // Get workspace for email
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });
    const inviterName = creator.user?.name || creator.user?.email || 'A member';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const inviteLink = `${clientUrl}/invite/${savedInvite.token}`;
    this.mailService
      .sendWorkspaceInviteEmail(
        email,
        workspace?.name || 'a workspace',
        inviterName,
        inviteLink,
      )
      .catch((e) => console.error('Background email failed:', e));

    return savedInvite;
  }

  async getInvites(workspaceId: string) {
    return this.workspaceInviteRepository.find({
      where: {
        workspaceId,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async revokeInvite(workspaceId: string, inviteId: string, actorId: string) {
    await this.policyService.assertAction(
      actorId,
      workspaceId,
      WorkspaceAction.MANAGE_MEMBERS,
    );
    const invite = await this.workspaceInviteRepository.findOne({
      where: { id: inviteId, workspaceId },
    });
    if (!invite) throw new NotFoundException('Invite not found');
    await this.workspaceInviteRepository.remove(invite);
    return { ok: true };
  }

  async getInviteMetadata(token: string) {
    const invite = await this.workspaceInviteRepository.findOne({
      where: { token, usedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      relations: ['workspace', 'creator'],
    });

    if (!invite) {
      throw new NotFoundException('Invite is invalid or has expired');
    }

    return {
      workspaceName: invite.workspace.name,
      role: invite.role,
      email: invite.email,
      creatorName: invite.creator?.name || invite.creator?.email,
    };
  }

  async acceptInvite(token: string, user: { id: string; email: string }) {
    const invite = await this.workspaceInviteRepository.findOne({
      where: { token, usedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      relations: ['workspace'],
    });

    if (!invite)
      throw new NotFoundException('Invite is invalid or has expired');
    if (invite.email !== user.email) {
      throw new ForbiddenException(
        'This invite was sent to a different email address',
      );
    }

    const existingMember = await this.workspaceMemberRepository.findOne({
      where: { workspaceId: invite.workspaceId, userId: user.id },
    });

    if (existingMember) {
      throw new ConflictException('You are already a member of this workspace');
    }

    const membership = this.workspaceMemberRepository.create({
      workspaceId: invite.workspaceId,
      userId: user.id,
      role: invite.role,
    });

    await this.workspaceMemberRepository.save(membership);

    invite.usedAt = new Date();
    await this.workspaceInviteRepository.save(invite);

    await this.activitiesService.logEvent({
      workspaceId: invite.workspaceId,
      actorId: user.id,
      type: EventType.MEMBER_JOINED,
      entityType: 'member',
      entityId: membership.id,
      metadata: { role: invite.role, email: user.email },
    });

    const otherMembers = await this.workspaceMemberRepository.find({
      where: { workspaceId: invite.workspaceId },
    });
    for (const member of otherMembers) {
      if (member.userId !== user.id) {
        await this.notificationsService.create({
          userId: member.userId,
          workspaceId: invite.workspaceId,
          type: 'workspace.member_joined',
          payload: { memberEmail: user.email },
        });
      }
    }

    return { workspaceId: invite.workspaceId };
  }

  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    role: WorkspaceRole,
    currentUserId: string,
  ) {
    await this.policyService.assertAction(
      currentUserId,
      workspaceId,
      WorkspaceAction.MANAGE_MEMBERS,
    );

    const currentUser = await this.policyService.assertUserIsWorkspaceMember(
      currentUserId,
      workspaceId,
    );
    if (
      currentUser.role === WorkspaceRole.ADMIN &&
      role === WorkspaceRole.OWNER
    ) {
      throw new ForbiddenException('Admins cannot grant owner role');
    }

    const member = await this.workspaceMemberRepository.findOne({
      where: { id: memberId, workspaceId },
      relations: ['user'],
    });
    if (!member) throw new NotFoundException('Member not found');
    if (member.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException(
        'Cannot change the role of the workspace owner',
      );
    }

    const oldRole = member.role;
    member.role = role;
    await this.workspaceMemberRepository.save(member);

    await this.activitiesService.logEvent({
      workspaceId,
      actorId: currentUserId,
      type: EventType.MEMBER_UPDATED,
      entityType: 'member',
      entityId: member.id,
      metadata: {
        email: member.user?.email,
        oldRole,
        newRole: role,
      },
    });

    return member;
  }

  async removeMember(
    workspaceId: string,
    memberId: string,
    currentUserId: string,
  ) {
    const memberToRemove = await this.workspaceMemberRepository.findOne({
      where: { id: memberId, workspaceId },
    });
    if (!memberToRemove) throw new NotFoundException('Member not found');

    if (memberToRemove.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException('Cannot remove the workspace owner');
    }

    const currentUserMembership =
      await this.policyService.assertUserIsWorkspaceMember(
        currentUserId,
        workspaceId,
      );
    await this.policyService.assertAction(
      currentUserId,
      workspaceId,
      WorkspaceAction.MANAGE_MEMBERS,
    );

    if (
      currentUserMembership.role === WorkspaceRole.ADMIN &&
      memberToRemove.role === WorkspaceRole.ADMIN
    ) {
      throw new ForbiddenException('Admins cannot remove other admins');
    }

    await this.workspaceMemberRepository.remove(memberToRemove);

    await this.activitiesService.logEvent({
      workspaceId,
      actorId: currentUserId,
      type: EventType.MEMBER_LEFT,
      entityType: 'member',
      entityId: memberToRemove.id,
      metadata: {
        role: memberToRemove.role,
        userId: memberToRemove.userId,
      },
    });

    const remainingMembers = await this.workspaceMemberRepository.find({
      where: { workspaceId },
      relations: ['user'],
    });
    for (const member of remainingMembers) {
      if (
        member.userId !== memberToRemove.userId &&
        member.userId !== currentUserId
      ) {
        await this.notificationsService.create({
          userId: member.userId,
          workspaceId,
          type: 'workspace.member_left',
          payload: { memberEmail: memberToRemove.user?.email || 'A member' },
        });
      }
    }

    // Kick the removed user from the workspace socket room immediately
    await this.realtimeGateway.removeUserFromWorkspace(
      memberToRemove.userId,
      workspaceId,
    );

    return { ok: true };
  }
}
