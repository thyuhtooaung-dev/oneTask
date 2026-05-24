import { SetMetadata } from '@nestjs/common';
import { WorkspaceRole } from '../entities/workspace-member.entity';

export const WORKSPACE_ROLES_KEY = 'workspace_roles';
export const Roles = (...roles: WorkspaceRole[]) =>
  SetMetadata(WORKSPACE_ROLES_KEY, roles);
