"use client";

import { Avatar } from "@/shared/ui/avatar/Avatar";
import {
	Activity,
	AlertCircle,
	CheckCircle2,
	Loader2,
	MessageSquare,
	Target,
	TrendingDown,
	TrendingUp,
	Trophy,
} from "lucide-react";
import { useAnalyticsData } from "../hooks/useAnalyticsData";

interface WorkspaceAnalyticsProps {
	workspaceId: string;
}

export function WorkspaceAnalytics({ workspaceId }: WorkspaceAnalyticsProps) {
	const { data, isLoading, error } = useAnalyticsData(workspaceId);

	const maxTrendCount = (() => {
		if (!data?.activityTrends?.length) return 1;
		return Math.max(...data.activityTrends.map((t) => t.count), 1);
	})();

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-violet-500" />
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="flex h-64 flex-col items-center justify-center text-red-400">
				<AlertCircle className="mb-2 h-8 w-8" />
				<p>Failed to load analytics</p>
			</div>
		);
	}

	const { workspaceInsights, memberInsights, activityTrends } = data;

	const renderTrend = (trend: number) => {
		if (trend > 0) {
			return (
				<span className="flex items-center text-emerald-400 text-xs font-medium mt-2">
					<TrendingUp className="w-3 h-3 mr-1" /> {trend}% vs last week
				</span>
			);
		}
		if (trend < 0) {
			return (
				<span className="flex items-center text-red-400 text-xs font-medium mt-2">
					<TrendingDown className="w-3 h-3 mr-1" /> {Math.abs(trend)}% vs last
					week
				</span>
			);
		}
		return (
			<span className="flex items-center text-zinc-500 text-xs font-medium mt-2">
				No change vs last week
			</span>
		);
	};

	return (
		<div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<header className="mb-8">
				<h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
					<Activity className="h-6 w-6 text-violet-400" />
					Workspace Insights
				</h1>
				<p className="text-sm text-zinc-400 mt-1">
					Real-time metrics and activity aggregation
				</p>
			</header>

			{/* Overview Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-zinc-900/60">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-sm font-medium text-zinc-400">
							Tasks Completed
						</h3>
						<div className="bg-emerald-500/10 p-2 rounded-lg">
							<CheckCircle2 className="h-4 w-4 text-emerald-400" />
						</div>
					</div>
					<p className="text-3xl font-bold text-zinc-100">
						{workspaceInsights.tasksCompleted.count}
					</p>
					{renderTrend(workspaceInsights.tasksCompleted.trend)}
				</div>

				<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-zinc-900/60">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-sm font-medium text-zinc-400">
							Comment Activity
						</h3>
						<div className="bg-violet-500/10 p-2 rounded-lg">
							<MessageSquare className="h-4 w-4 text-violet-400" />
						</div>
					</div>
					<p className="text-3xl font-bold text-zinc-100">
						{workspaceInsights.comments.count}
					</p>
					{renderTrend(workspaceInsights.comments.trend)}
				</div>

				<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-zinc-900/60">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-sm font-medium text-zinc-400">
							Most Active Project
						</h3>
						<div className="bg-blue-500/10 p-2 rounded-lg">
							<Target className="h-4 w-4 text-blue-400" />
						</div>
					</div>
					<p className="text-lg font-bold text-zinc-100 truncate mt-1">
						{workspaceInsights.mostActiveProject?.name || "No data"}
					</p>
					{workspaceInsights.mostActiveProject && (
						<p className="text-xs font-medium text-zinc-500 mt-2">
							{workspaceInsights.mostActiveProject.eventCount} events this week
						</p>
					)}
				</div>

				<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-zinc-900/60">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-sm font-medium text-zinc-400">Overdue Tasks</h3>
						<div className="bg-red-500/10 p-2 rounded-lg">
							<AlertCircle className="h-4 w-4 text-red-400" />
						</div>
					</div>
					<p className="text-3xl font-bold text-red-400">
						{workspaceInsights.overdueTasksCount}
					</p>
					<p className="text-xs font-medium text-zinc-500 mt-2">
						Require immediate attention
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
				{/* Activity Trend Chart */}
				<div className="lg:col-span-2 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 backdrop-blur-xl">
					<h3 className="text-sm font-semibold text-zinc-200 mb-6 flex items-center gap-2">
						<TrendingUp className="h-4 w-4 text-violet-400" />
						Activity Trends (Last 7 Days)
					</h3>
					<div className="h-48 flex items-end gap-2 mt-4 relative">
						{activityTrends.length === 0 ? (
							<div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
								No activity data available
							</div>
						) : (
							activityTrends.map((trend) => (
								<div
									key={trend.date}
									className="flex-1 flex flex-col items-center group relative h-full justify-end"
								>
									<div
										className="w-full bg-violet-500/20 hover:bg-violet-500/40 rounded-t-sm transition-all duration-300 relative group-hover:bg-violet-500/60"
										style={{
											height: `${Math.max((trend.count / maxTrendCount) * 100, 2)}%`,
										}}
									>
										<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-zinc-200 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-10 border border-zinc-700">
											{trend.count} events
										</div>
									</div>
									<div className="text-[10px] text-zinc-500 mt-2 truncate w-full text-center">
										{new Date(trend.date).toLocaleDateString(undefined, {
											weekday: "short",
										})}
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Member Leaderboard */}
				<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 backdrop-blur-xl flex flex-col">
					<h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
						<Trophy className="h-4 w-4 text-amber-400" />
						Top Contributors
					</h3>
					<div className="space-y-4 overflow-y-auto flex-1 pr-2">
						{memberInsights.taskCompletions.length === 0 ? (
							<div className="flex h-full items-center justify-center text-sm text-zinc-500">
								No data available
							</div>
						) : (
							memberInsights.taskCompletions.slice(0, 5).map((member, idx) => (
								<div key={member.userId} className="flex items-center gap-3">
									<div className="shrink-0 w-6 text-center text-xs font-bold text-zinc-500">
										{idx + 1}
									</div>
									<Avatar name={member.name} email={member.email} size="sm" />
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium text-zinc-200">
											{member.name || member.email || "Unknown User"}
										</p>
										<p className="truncate text-[11px] text-zinc-500">
											{member.count} tasks completed
										</p>
									</div>
									{idx === 0 && (
										<div className="bg-amber-500/10 text-amber-400 p-1.5 rounded-full">
											<Trophy className="h-3 w-3" />
										</div>
									)}
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
