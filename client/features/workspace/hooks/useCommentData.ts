"use client";

import { axiosClient } from "@/lib/api/axiosClient";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { WorkspaceUser } from "./useWorkspaceData";

export interface CommentAttachment {
	name: string;
	type: string;
	size: number;
	dataUrl: string;
}

export interface TaskComment {
	id: string;
	taskId: string;
	authorId: string;
	content: string;
	attachments?: CommentAttachment[] | null;
	createdAt: string;
	updatedAt: string;
	author?: WorkspaceUser;
}

export interface CommentPayload {
	content: string;
	attachments?: CommentAttachment[];
}

export function useComments(taskId?: string | null) {
	return useQuery<TaskComment[]>({
		queryKey: queryKeys.tasks.comments(taskId || ""),
		queryFn: async () => {
			if (!taskId) return [];
			const response = await axiosClient.get<TaskComment[]>(
				`/tasks/${taskId}/comments`,
			);
			return response.data;
		},
		enabled: !!taskId,
	});
}

export function useCreateComment(
	taskId?: string | null,
	workspaceId?: string | null,
) {
	const queryClient = useQueryClient();

	return useMutation<TaskComment, Error, CommentPayload>({
		mutationFn: async (body) => {
			if (!taskId) throw new Error("Task ID is required");
			const response = await axiosClient.post<TaskComment>(
				`/tasks/${taskId}/comments`,
				body,
			);
			return response.data;
		},
		onSuccess: () => {
			if (taskId) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.tasks.comments(taskId),
				});
			}

			if (workspaceId) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.activities(workspaceId),
				});
			}
		},
	});
}

export function useUpdateComment(
	taskId?: string | null,
	workspaceId?: string | null,
) {
	const queryClient = useQueryClient();

	return useMutation<
		TaskComment,
		Error,
		{ commentId: string } & CommentPayload
	>({
		mutationFn: async ({ commentId, content, attachments }) => {
			if (!taskId) throw new Error("Task ID is required");
			const response = await axiosClient.patch<TaskComment>(
				`/tasks/${taskId}/comments/${commentId}`,
				{ content, attachments },
			);
			return response.data;
		},
		onSuccess: () => {
			if (taskId) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.tasks.comments(taskId),
				});
			}

			if (workspaceId) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.activities(workspaceId),
				});
			}
		},
	});
}

export function useDeleteComment(
	taskId?: string | null,
	workspaceId?: string | null,
) {
	const queryClient = useQueryClient();

	return useMutation<{ success: boolean }, Error, string>({
		mutationFn: async (commentId) => {
			if (!taskId) throw new Error("Task ID is required");
			const response = await axiosClient.delete<{ success: boolean }>(
				`/tasks/${taskId}/comments/${commentId}`,
			);
			return response.data;
		},
		onSuccess: () => {
			if (taskId) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.tasks.comments(taskId),
				});
			}

			if (workspaceId) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.activities(workspaceId),
				});
			}
		},
	});
}
