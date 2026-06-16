"use client";

import { axiosClient } from "@/lib/api/axiosClient";
import { queryKeys } from "@/lib/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// --- Types ---

export interface DailyReport {
	id: string;
	workspaceId: string;
	authorId: string;
	reportDate: string;
	completedWork: string;
	nextPlans: string;
	blockers?: string | null;
	createdAt: string;
	updatedAt: string;
	author?: {
		id: string;
		name?: string;
		email: string;
		avatarUrl?: string;
	};
}

export interface ReportSummaryMember {
	userId: string;
	name: string;
	email?: string;
	role?: string;
}

export interface ReportSummarySubmission {
	userId: string;
	name: string;
	email?: string;
	report: DailyReport;
}

export interface MemberWorkload {
	userId: string;
	name: string;
	email?: string;
	inProgress: number;
	done: number;
	overdue: number;
	todo: number;
}

export interface BottleneckTask {
	id: string;
	title: string;
	assignee: { name?: string; email?: string } | null;
	dueDate?: string | null;
	updatedAt: string;
	daysSinceUpdate: number;
}

export interface ReportSummary {
	date: string;
	submitted: ReportSummarySubmission[];
	notSubmitted: ReportSummaryMember[];
	memberWorkload: MemberWorkload[];
	bottleneckTasks: BottleneckTask[];
}

// --- Hooks ---

export function useReports(
	workspaceId: string | null,
	filters?: { date?: string; authorId?: string; limit?: number },
) {
	return useQuery<DailyReport[]>({
		queryKey: queryKeys.reports.list(workspaceId || "", filters),
		queryFn: async () => {
			if (!workspaceId) return [];
			const params = new URLSearchParams();
			if (filters?.date) params.set("date", filters.date);
			if (filters?.authorId) params.set("authorId", filters.authorId);
			if (filters?.limit) params.set("limit", String(filters.limit));

			const { data } = await axiosClient.get<DailyReport[]>(
				`/workspaces/${workspaceId}/reports?${params.toString()}`,
			);
			return data;
		},
		enabled: !!workspaceId,
	});
}

export function useReportSummary(workspaceId: string | null) {
	return useQuery<ReportSummary>({
		queryKey: queryKeys.reports.summary(workspaceId || ""),
		queryFn: async () => {
			if (!workspaceId) throw new Error("Workspace ID is required");
			const { data } = await axiosClient.get<ReportSummary>(
				`/workspaces/${workspaceId}/reports/summary`,
			);
			return data;
		},
		enabled: !!workspaceId,
		refetchInterval: 30000,
	});
}

export function useSubmitReport(workspaceId: string | null) {
	const queryClient = useQueryClient();

	return useMutation<
		DailyReport,
		Error,
		{
			completedWork: string;
			nextPlans: string;
			blockers?: string | null;
			reportDate?: string;
		}
	>({
		mutationFn: async (body) => {
			if (!workspaceId)
				throw new Error("Workspace ID is required to submit a report");
			const { data } = await axiosClient.post<DailyReport>(
				`/workspaces/${workspaceId}/reports`,
				body,
			);
			return data;
		},
		onSuccess: () => {
			if (workspaceId) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.reports.list(workspaceId),
				});
				queryClient.invalidateQueries({
					queryKey: queryKeys.reports.summary(workspaceId),
				});
			}
		},
	});
}
