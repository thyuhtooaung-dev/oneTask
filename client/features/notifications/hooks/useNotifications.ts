import { axiosClient } from "@/lib/api/axiosClient";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Notification {
	id: string;
	userId: string;
	workspaceId: string;
	type: string;
	payload: Record<string, unknown>;
	read: boolean;
	createdAt: string;
}

export function useNotifications() {
	return useQuery<Notification[]>({
		queryKey: queryKeys.notifications.all(),
		queryFn: async () => {
			const res = await axiosClient.get("/notifications");
			return res.data;
		},
	});
}

export function useMarkNotificationAsRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const res = await axiosClient.patch(`/notifications/${id}/read`);
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.notifications.all(),
			});
		},
	});
}

export function useMarkAllNotificationsAsRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const res = await axiosClient.patch("/notifications/read-all");
			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.notifications.all(),
			});
		},
	});
}
