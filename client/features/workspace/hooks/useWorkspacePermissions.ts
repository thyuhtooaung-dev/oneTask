import { useAuth } from "@/features/auth/hooks/useAuth";
import {
	type WorkspaceRole,
	canComment,
	canInviteMembers,
	canManageMembers,
	canManageProjects,
	canManageTasks,
	canManageWorkspace,
} from "../permissions";
import { useWorkspaceDetail } from "./useWorkspaceData";

export function useWorkspacePermissions(workspaceId: string | null) {
	const { user } = useAuth();
	const { data: workspace } = useWorkspaceDetail(workspaceId || "");

	const member = workspace?.members.find((m) => m.userId === user?.id);
	const role = member?.role as WorkspaceRole | undefined;

	return {
		role,
		isMember: !!member,
		canManageWorkspace: canManageWorkspace(role),
		canManageMembers: canManageMembers(role),
		canManageProjects: canManageProjects(role),
		canManageTasks: canManageTasks(role),
		canInviteMembers: canInviteMembers(role),
		canComment: canComment(role),
	};
}
