"use client";

import { axiosClient } from "@/lib/api/axiosClient";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Workspace {
	id: string;
	name: string;
	description?: string;
	ownerId: string;
	createdAt: string;
}

export interface WorkspaceUser {
	id: string;
	email: string;
	name?: string;
	avatarUrl?: string;
}

export interface WorkspaceMember {
	id: string;
	workspaceId: string;
	userId: string;
	role: string;
	user: WorkspaceUser;
}

export interface WorkspaceDetail extends Workspace {
	members: WorkspaceMember[];
}

export interface Project {
	id: string;
	name: string;
	description?: string;
	workspaceId: string;
	isPrivate?: boolean;
	createdAt: string;
}

export interface WorkspaceInvite {
	id: string;
	workspaceId: string;
	email: string;
	token: string;
	role: string;
	expiresAt: string;
}

// Key factory for React Query caching
export function useWorkspaces() {
	return useQuery<Workspace[]>({
		queryKey: queryKeys.workspaces.all(),
		queryFn: async () => {
			const response = await axiosClient.get<Workspace[]>("/workspaces");
			return response.data;
		},
	});
}

export function useWorkspaceDetail(workspaceId: string | null) {
	return useQuery<WorkspaceDetail | null>({
		queryKey: queryKeys.workspaces.detail(workspaceId || ""),
		queryFn: async () => {
			if (!workspaceId) return null;
			const response = await axiosClient.get<WorkspaceDetail>(
				`/workspaces/${workspaceId}`,
			);
			return response.data;
		},
		enabled: !!workspaceId,
	});
}

/**
 * Creates a new workspace
 */
export function useCreateWorkspace() {
	const queryClient = useQueryClient();

	return useMutation<Workspace, Error, { name: string; description?: string }>({
		mutationFn: async (body) => {
			const response = await axiosClient.post<Workspace>("/workspaces", body);
			return response.data;
		},
		onSuccess: () => {
			// Invalidate workspace cache to trigger instant refresh
			queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() });
		},
	});
}

/**
 * Fetches projects belonging to a workspace
 */
export function useProjects(workspaceId: string | null) {
	return useQuery<Project[]>({
		queryKey: queryKeys.workspaces.projects(workspaceId || ""),
		queryFn: async () => {
			if (!workspaceId) return [];
			const response = await axiosClient.get<Project[]>(
				`/workspaces/${workspaceId}/projects`,
			);
			return response.data;
		},
		enabled: !!workspaceId, // Only fetch if workspaceId is present
	});
}

/**
 * Creates a new project in a workspace
 */
export function useCreateProject(workspaceId: string | null) {
	const queryClient = useQueryClient();

	return useMutation<
		Project,
		Error,
		{ name: string; description?: string; isPrivate?: boolean }
	>({
		mutationFn: async (body) => {
			if (!workspaceId)
				throw new Error("Workspace ID is required to create a project");
			const response = await axiosClient.post<Project>(
				`/workspaces/${workspaceId}/projects`,
				body,
			);
			return response.data;
		},
		onSuccess: () => {
			// Invalidate project list cache under this workspace
			if (workspaceId) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.projects(workspaceId),
				});
			}
		},
	});
}

/**
 * Updates a project
 */
export function useUpdateProject(workspaceId: string | null) {
	const queryClient = useQueryClient();

	return useMutation<
		Project,
		Error,
		{ projectId: string; name?: string; description?: string }
	>({
		mutationFn: async ({ projectId, ...body }) => {
			if (!workspaceId) throw new Error("Workspace ID is required");
			const response = await axiosClient.patch<Project>(
				`/workspaces/${workspaceId}/projects/${projectId}`,
				body,
			);
			return response.data;
		},
		onSuccess: () => {
			if (workspaceId) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.projects(workspaceId),
				});
			}
		},
	});
}

/**
 * Archives a project
 */
export function useArchiveProject(workspaceId: string | null) {
	const queryClient = useQueryClient();

	return useMutation<Project, Error, string>({
		mutationFn: async (projectId) => {
			if (!workspaceId) throw new Error("Workspace ID is required");
			const response = await axiosClient.post<Project>(
				`/workspaces/${workspaceId}/projects/${projectId}/archive`,
			);
			return response.data;
		},
		onSuccess: () => {
			if (workspaceId) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.projects(workspaceId),
				});
			}
		},
	});
}

export function useWorkspaceInvites(workspaceId: string | null) {
	return useQuery<WorkspaceInvite[]>({
		queryKey: queryKeys.workspaces.invites(workspaceId || ""),
		queryFn: async () => {
			if (!workspaceId) return [];
			const response = await axiosClient.get<WorkspaceInvite[]>(
				`/workspaces/${workspaceId}/invites`,
			);
			return response.data;
		},
		enabled: !!workspaceId,
	});
}

export function useCreateInvite(workspaceId: string | null) {
	const queryClient = useQueryClient();
	return useMutation<WorkspaceInvite, Error, { email: string; role: string }>({
		mutationFn: async (body) => {
			if (!workspaceId) throw new Error("Workspace ID required");
			const response = await axiosClient.post<WorkspaceInvite>(
				`/workspaces/${workspaceId}/invites`,
				body,
			);
			return response.data;
		},
		onSuccess: () => {
			if (workspaceId) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.invites(workspaceId),
				});
			}
		},
	});
}

export function useRevokeInvite(workspaceId: string | null) {
	const queryClient = useQueryClient();
	return useMutation<void, Error, string>({
		mutationFn: async (inviteId) => {
			if (!workspaceId) throw new Error("Workspace ID required");
			await axiosClient.delete(
				`/workspaces/${workspaceId}/invites/${inviteId}`,
			);
		},
		onSuccess: () => {
			if (workspaceId) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.invites(workspaceId),
				});
			}
		},
	});
}

export function useUpdateMemberRole(workspaceId: string | null) {
	const queryClient = useQueryClient();
	return useMutation<void, Error, { memberId: string; role: string }>({
		mutationFn: async ({ memberId, role }) => {
			if (!workspaceId) throw new Error("Workspace ID required");
			await axiosClient.patch(
				`/workspaces/${workspaceId}/members/${memberId}`,
				{ role },
			);
		},
		onSuccess: () => {
			if (workspaceId) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.detail(workspaceId),
				});
			}
		},
	});
}

export function useRemoveMember(workspaceId: string | null) {
	const queryClient = useQueryClient();
	return useMutation<void, Error, string>({
		mutationFn: async (memberId) => {
			if (!workspaceId) throw new Error("Workspace ID required");
			await axiosClient.delete(
				`/workspaces/${workspaceId}/members/${memberId}`,
			);
		},
		onSuccess: () => {
			if (workspaceId) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.detail(workspaceId),
				});
			}
		},
	});
}

export function useGetInviteMetadata(token: string | null) {
	return useQuery<{
		workspaceName: string;
		role: string;
		email: string;
		creatorName?: string;
	} | null>({
		queryKey: ["invites", token || ""],
		queryFn: async () => {
			if (!token) return null;
			const response = await axiosClient.get(`/workspaces/invites/${token}`);
			return response.data;
		},
		enabled: !!token,
		retry: false, // Don't retry if invite is invalid
	});
}

export function useAcceptInvite() {
	return useMutation<{ workspaceId: string }, Error, string>({
		mutationFn: async (token) => {
			const response = await axiosClient.post(
				`/workspaces/invites/${token}/accept`,
			);
			return response.data;
		},
	});
}
