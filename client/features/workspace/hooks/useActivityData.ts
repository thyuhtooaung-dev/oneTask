"use client";

import { axiosClient } from "@/lib/api/axiosClient";
import { useQuery } from "@tanstack/react-query";
import type { WorkspaceUser } from "./useWorkspaceData";

export type ActivityEventType =
	| "task.created"
	| "task.updated"
	| "task.deleted"
	| "comment.created"
	| "member.joined"
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

export const activityKeys = {
	all: (workspaceId: string) =>
		["workspaces", workspaceId, "activities"] as const,
};

export function useActivities(workspaceId: string | null) {
	return useQuery<ActivityEvent[]>({
		queryKey: activityKeys.all(workspaceId || ""),
		queryFn: async () => {
			if (!workspaceId) return [];
			const response = await axiosClient.get<ActivityEvent[]>(
				`/workspaces/${workspaceId}/activities`,
			);
			return response.data;
		},
		enabled: !!workspaceId,
	});
}
