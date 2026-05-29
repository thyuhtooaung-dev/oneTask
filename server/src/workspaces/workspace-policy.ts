import { WorkspaceRole } from './entities/workspace-member.entity';

export enum WorkspaceAction {
  MANAGE_WORKSPACE = 'manage_workspace',
  MANAGE_MEMBERS = 'manage_members',
  MANAGE_PROJECTS = 'manage_projects',
  MANAGE_TASKS = 'manage_tasks',
  COMMENT = 'comment',
}

const rolePermissions: Record<WorkspaceRole, WorkspaceAction[]> = {
  [WorkspaceRole.OWNER]: [
    WorkspaceAction.MANAGE_WORKSPACE,
    WorkspaceAction.MANAGE_MEMBERS,
    WorkspaceAction.MANAGE_PROJECTS,
    WorkspaceAction.MANAGE_TASKS,
    WorkspaceAction.COMMENT,
  ],
  [WorkspaceRole.ADMIN]: [
    WorkspaceAction.MANAGE_MEMBERS,
    WorkspaceAction.MANAGE_PROJECTS,
    WorkspaceAction.MANAGE_TASKS,
    WorkspaceAction.COMMENT,
  ],
  [WorkspaceRole.MEMBER]: [
    WorkspaceAction.MANAGE_TASKS,
    WorkspaceAction.COMMENT,
  ],
};

export function can(role: WorkspaceRole, action: WorkspaceAction): boolean {
  const permissions = rolePermissions[role];
  return permissions ? permissions.includes(action) : false;
}
