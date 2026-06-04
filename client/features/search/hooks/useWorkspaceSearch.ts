"use client";

import { axiosClient } from "@/lib/api/axiosClient";
import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";

export type SearchEntityType =
	| "task"
	| "project"
	| "comment"
	| "member"
	| "activity";

export interface SearchResultItem {
	id: string;
	type: SearchEntityType;
	title: string;
	subtitle?: string;
	description?: string;
	parentId?: string;
	metadata?: Record<string, unknown>;
	createdAt?: string;
	updatedAt?: string;
}

export interface SearchResultGroup {
	type: SearchEntityType;
	label: string;
	items: SearchResultItem[];
}

export interface WorkspaceSearchResponse {
	query: string;
	total: number;
	groups: SearchResultGroup[];
}

export function useWorkspaceSearch(workspaceId: string | null, query: string) {
	const normalizedQuery = query.trim();

	return useQuery<WorkspaceSearchResponse>({
		queryKey: queryKeys.workspaces.search(workspaceId || "", normalizedQuery),
		queryFn: async () => {
			if (!workspaceId || !normalizedQuery) {
				return { query: normalizedQuery, total: 0, groups: [] };
			}

			const response = await axiosClient.get<WorkspaceSearchResponse>(
				`/workspaces/${workspaceId}/search`,
				{
					params: {
						q: normalizedQuery,
						limit: 6,
					},
				},
			);

			return response.data;
		},
		enabled: !!workspaceId && normalizedQuery.length > 0,
		staleTime: 15_000,
	});
}
