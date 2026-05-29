export type WorkspaceRole = "owner" | "admin" | "member";

export const canManageWorkspace = (role?: WorkspaceRole) => role === "owner";
export const canManageMembers = (role?: WorkspaceRole) =>
	role === "owner" || role === "admin";
export const canManageProjects = (role?: WorkspaceRole) =>
	role === "owner" || role === "admin";
export const canManageTasks = (role?: WorkspaceRole) =>
	role === "owner" || role === "admin" || role === "member";
export const canInviteMembers = (role?: WorkspaceRole) =>
	role === "owner" || role === "admin";
export const canComment = (role?: WorkspaceRole) =>
	role === "owner" || role === "admin" || role === "member";
