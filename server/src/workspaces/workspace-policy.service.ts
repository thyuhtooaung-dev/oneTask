import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { WorkspaceAction, can } from './workspace-policy';

@Injectable()
export class WorkspacePolicyService {
  constructor(
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
  ) {}

  async assertUserIsWorkspaceMember(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceMember> {
    const member = await this.workspaceMemberRepository.findOne({
      where: { userId, workspaceId },
      relations: ['user'],
    });
    if (!member) {
      throw new ForbiddenException('User is not a member of this workspace');
    }
    return member;
  }

  async assertAction(
    userId: string,
    workspaceId: string,
    action: WorkspaceAction,
  ): Promise<void> {
    const member = await this.assertUserIsWorkspaceMember(userId, workspaceId);
    if (!can(member.role, action)) {
      throw new ForbiddenException(`You do not have permission to ${action}`);
    }
  }
}
