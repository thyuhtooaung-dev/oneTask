"use client";

import { axiosClient } from "@/lib/api/axiosClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Workspace {
	id: string;
	name: string;
	description?: string;
	ownerId: string;
	createdAt: string;
}

export interface Project {
	id: string;
	name: string;
	description?: string;
	workspaceId: string;
	createdAt: string;
}

// Key factory for React Query caching
export const workspaceKeys = {
	all: ["workspaces"] as const,
	projects: (workspaceId: string) =>
		["workspaces", workspaceId, "projects"] as const,
};

/**
 * Fetches all workspaces for the authenticated user
 */
export function useWorkspaces() {
	return useQuery<Workspace[]>({
		queryKey: workspaceKeys.all,
		queryFn: async () => {
			const response = await axiosClient.get<Workspace[]>("/workspaces");
			return response.data;
		},
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
			queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
		},
	});
}

/**
 * Fetches projects belonging to a workspace
 */
export function useProjects(workspaceId: string | null) {
	return useQuery<Project[]>({
		queryKey: workspaceKeys.projects(workspaceId || ""),
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

	return useMutation<Project, Error, { name: string; description?: string }>({
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
					queryKey: workspaceKeys.projects(workspaceId),
				});
			}
		},
	});
}
