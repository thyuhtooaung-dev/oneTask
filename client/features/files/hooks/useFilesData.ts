import { axiosClient } from "@/lib/api/axiosClient";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface FileAttachment {
	id: string;
	workspaceId: string;
	projectId?: string;
	taskId?: string;
	commentId?: string;
	folder: string;
	uploaderId: string;
	originalName: string;
	filename: string;
	mimetype: string;
	size: string;
	fileUrl?: string;
	filePath?: string;
	createdAt: string;
	updatedAt: string;
	uploader?: {
		id: string;
		name: string;
		email: string;
		avatarUrl?: string;
	};
}

export function useProjectFiles(workspaceId: string, projectId: string) {
	return useQuery({
		queryKey: queryKeys.files.all(workspaceId, projectId),
		queryFn: async () => {
			const res = await axiosClient.get<FileAttachment[]>(
				`/workspaces/${workspaceId}/projects/${projectId}/files`,
			);
			return res.data;
		},
		enabled: !!workspaceId && !!projectId,
	});
}

export function useTaskFiles(
	workspaceId: string,
	projectId: string,
	taskId: string,
) {
	return useQuery({
		queryKey: queryKeys.files.byTask(workspaceId, taskId),
		queryFn: async () => {
			const res = await axiosClient.get<FileAttachment[]>(
				`/workspaces/${workspaceId}/projects/${projectId}/files?taskId=${taskId}`,
			);
			return res.data;
		},
		enabled: !!workspaceId && !!projectId && !!taskId,
	});
}

export function useUploadFile(workspaceId: string, projectId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: {
			file: File;
			folder?: string;
			taskId?: string;
			commentId?: string;
			onProgress?: (progress: number) => void;
		}) => {
			const formData = new FormData();
			formData.append("file", data.file);
			if (data.folder) formData.append("folder", data.folder);
			if (data.taskId) formData.append("taskId", data.taskId);
			if (data.commentId) formData.append("commentId", data.commentId);

			const res = await axiosClient.post<FileAttachment>(
				`/workspaces/${workspaceId}/projects/${projectId}/files`,
				formData,
				{
					headers: { "Content-Type": "multipart/form-data" },
					onUploadProgress: (progressEvent) => {
						if (progressEvent.total && data.onProgress) {
							const percentCompleted = Math.round(
								(progressEvent.loaded * 100) / progressEvent.total,
							);
							data.onProgress(percentCompleted);
						}
					},
				},
			);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["files", workspaceId],
			});
		},
	});
}

export function useDeleteFile(workspaceId: string, projectId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (fileId: string) => {
			await axiosClient.delete(
				`/workspaces/${workspaceId}/projects/${projectId}/files/${fileId}`,
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["files", workspaceId],
			});
		},
	});
}
