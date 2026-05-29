"use client";

import { axiosClient } from "@/lib/api/axiosClient";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Project, WorkspaceUser } from "./useWorkspaceData";

export type TaskStatus = "todo" | "in_progress" | "done" | "canceled";

export interface Task {
	id: string;
	workspaceId: string;
	projectId: string;
	title: string;
	description?: string;
	status: TaskStatus;
	assigneeId?: string | null;
	reporterId?: string | null;
	dueDate?: string | null;
	createdAt: string;
	updatedAt: string;
	project?: Project;
	assignee?: WorkspaceUser | null;
	reporter?: WorkspaceUser | null;
}

interface TaskPayload {
	title: string;
	description?: string;
	status?: TaskStatus;
	projectId: string;
	assigneeId?: string | null;
}

interface UpdateTaskPayload {
	taskId: string;
	title?: string;
	description?: string | null;
	status?: TaskStatus;
	assigneeId?: string | null;
}

export function useTasks(workspaceId: string | null) {
	return useQuery<Task[]>({
		queryKey: queryKeys.workspaces.tasks(workspaceId || ""),
		queryFn: async () => {
			if (!workspaceId) return [];
			const response = await axiosClient.get<Task[]>(
				`/workspaces/${workspaceId}/tasks`,
			);
			return response.data;
		},
		enabled: !!workspaceId,
	});
}

export function useCreateTask(workspaceId: string | null) {
	const queryClient = useQueryClient();

	return useMutation<Task, Error, TaskPayload>({
		mutationFn: async (body) => {
			if (!workspaceId) throw new Error("Workspace ID is required");
			const response = await axiosClient.post<Task>(
				`/workspaces/${workspaceId}/tasks`,
				body,
			);
			return response.data;
		},
		onSuccess: () => {
			if (!workspaceId) return;
			queryClient.invalidateQueries({
				queryKey: queryKeys.workspaces.tasks(workspaceId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.workspaces.activities(workspaceId),
			});
		},
	});
}

export function useUpdateTask(workspaceId: string | null) {
	const queryClient = useQueryClient();

	return useMutation<Task, Error, UpdateTaskPayload>({
		mutationFn: async ({ taskId, ...body }) => {
			const response = await axiosClient.patch<Task>(`/tasks/${taskId}`, body);
			return response.data;
		},
		onSuccess: () => {
			if (!workspaceId) return;
			queryClient.invalidateQueries({
				queryKey: queryKeys.workspaces.tasks(workspaceId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.workspaces.activities(workspaceId),
			});
		},
	});
}

export function useDeleteTask(workspaceId: string | null) {
	const queryClient = useQueryClient();

	return useMutation<{ deleted: true }, Error, string>({
		mutationFn: async (taskId) => {
			const response = await axiosClient.delete<{ deleted: true }>(
				`/tasks/${taskId}`,
			);
			return response.data;
		},
		onSuccess: () => {
			if (!workspaceId) return;
			queryClient.invalidateQueries({
				queryKey: queryKeys.workspaces.tasks(workspaceId),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.workspaces.activities(workspaceId),
			});
		},
	});
}
