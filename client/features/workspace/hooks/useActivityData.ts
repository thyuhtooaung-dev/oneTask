"use client";

import { axiosClient } from "@/lib/api/axiosClient";
import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";
import type { WorkspaceUser } from "./useWorkspaceData";

export type ActivityEventType =
	| "task.created"
	| "task.updated"
	| "task.deleted"
	| "comment.created"
	| "member.joined"
	| "member.left"
	| "member.updated"
	| "workspace.created"
	| "project.created";

export interface ActivityEvent {
	id: string;
	workspaceId: string;
	actorId: string;
	type: ActivityEventType;
	entityType?: string;
	entityId?: string;
	metadata?: Record<string, unknown>;
	createdAt: string;
	actor?: WorkspaceUser;
}

export function useActivities(
	workspaceId: string | null,
	filters?: { type?: string; actorId?: string; limit?: number },
) {
	return useQuery<ActivityEvent[]>({
		queryKey: queryKeys.workspaces.activities(workspaceId || "", filters),
		queryFn: async () => {
			if (!workspaceId) return [];
			const response = await axiosClient.get<ActivityEvent[]>(
				`/workspaces/${workspaceId}/activities`,
				{ params: filters },
			);
			return response.data;
		},
		enabled: !!workspaceId,
	});
}
