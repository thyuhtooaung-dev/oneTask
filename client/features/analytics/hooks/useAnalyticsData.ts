import { axiosClient } from "@/lib/api/axiosClient";
import { useQuery } from "@tanstack/react-query";

export interface WorkspaceInsights {
	tasksCompleted: { count: number; trend: number };
	comments: { count: number; trend: number };
	mostActiveProject: { id: string; name: string; eventCount: number } | null;
	overdueTasksCount: number;
}

export interface MemberInsights {
	mostActiveContributor: {
		userId: string;
		name?: string;
		email?: string;
		eventCount: number;
	} | null;
	taskCompletions: {
		userId: string;
		name?: string;
		email?: string;
		count: number;
	}[];
	commentParticipation: {
		userId: string;
		name?: string;
		email?: string;
		count: number;
	}[];
}

export interface ActivityTrend {
	date: string; // ISO date string
	count: number;
}

export interface AnalyticsData {
	workspaceInsights: WorkspaceInsights;
	memberInsights: MemberInsights;
	activityTrends: ActivityTrend[];
}

export const useAnalyticsData = (workspaceId: string | null) => {
	return useQuery({
		queryKey: ["workspace-analytics", workspaceId],
		queryFn: async () => {
			if (!workspaceId) throw new Error("Workspace ID is required");
			const { data } = await axiosClient.get<AnalyticsData>(
				`/workspaces/${workspaceId}/analytics/insights`,
			);
			return data;
		},
		enabled: !!workspaceId,
		refetchInterval: 30000, // Refetch every 30 seconds for live updates
	});
};
