"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { cn } from "@/shared/ui/cn";
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	ClipboardList,
	Clock3,
	FileText,
	Loader2,
	Send,
	Timer,
	Users,
} from "lucide-react";
import { useState } from "react";
import {
	type DailyReport,
	useReportSummary,
	useReports,
	useSubmitReport,
} from "../hooks/useReportsData";

interface WorkspaceReportsProps {
	workspaceId: string;
}

type Tab = "dashboard" | "my-report";

function formatRelativeDay(dateStr: string) {
	const today = new Date().toISOString().split("T")[0];
	const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
	if (dateStr === today) return "Today";
	if (dateStr === yesterday) return "Yesterday";
	return new Date(dateStr).toLocaleDateString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
}

// ─── Dashboard Tab ────────────────────────────────────────────────
function DashboardView({ workspaceId }: { workspaceId: string }) {
	const { data: summary, isLoading, error } = useReportSummary(workspaceId);

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-violet-500" />
			</div>
		);
	}

	if (error || !summary) {
		return (
			<div className="flex h-64 flex-col items-center justify-center text-red-400">
				<AlertCircle className="mb-2 h-8 w-8" />
				<p>Failed to load report summary</p>
			</div>
		);
	}

	const totalMembers = summary.submitted.length + summary.notSubmitted.length;
	const submissionRate =
		totalMembers > 0
			? Math.round((summary.submitted.length / totalMembers) * 100)
			: 0;

	return (
		<div className="space-y-6">
			{/* Overview Cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-zinc-900/60">
					<div className="mb-4 flex items-center justify-between">
						<h3 className="text-sm font-medium text-zinc-400">
							Submitted Today
						</h3>
						<div className="rounded-lg bg-emerald-500/10 p-2">
							<CheckCircle2 className="h-4 w-4 text-emerald-400" />
						</div>
					</div>
					<p className="text-3xl font-bold text-zinc-100">
						{summary.submitted.length}
					</p>
					<p className="mt-2 text-xs font-medium text-zinc-500">
						of {totalMembers} members
					</p>
				</div>

				<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-zinc-900/60">
					<div className="mb-4 flex items-center justify-between">
						<h3 className="text-sm font-medium text-zinc-400">Not Submitted</h3>
						<div className="rounded-lg bg-amber-500/10 p-2">
							<AlertTriangle className="h-4 w-4 text-amber-400" />
						</div>
					</div>
					<p className="text-3xl font-bold text-amber-300">
						{summary.notSubmitted.length}
					</p>
					<p className="mt-2 text-xs font-medium text-zinc-500">
						members pending
					</p>
				</div>

				<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-zinc-900/60">
					<div className="mb-4 flex items-center justify-between">
						<h3 className="text-sm font-medium text-zinc-400">
							Submission Rate
						</h3>
						<div className="rounded-lg bg-violet-500/10 p-2">
							<Users className="h-4 w-4 text-violet-400" />
						</div>
					</div>
					<p className="text-3xl font-bold text-zinc-100">{submissionRate}%</p>
					<div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
						<div
							className="h-full rounded-full bg-linear-to-r from-violet-500 to-violet-400 transition-all duration-500"
							style={{ width: `${submissionRate}%` }}
						/>
					</div>
				</div>

				<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:bg-zinc-900/60">
					<div className="mb-4 flex items-center justify-between">
						<h3 className="text-sm font-medium text-zinc-400">Bottlenecks</h3>
						<div className="rounded-lg bg-red-500/10 p-2">
							<Timer className="h-4 w-4 text-red-400" />
						</div>
					</div>
					<p className="text-3xl font-bold text-red-400">
						{summary.bottleneckTasks.length}
					</p>
					<p className="mt-2 text-xs font-medium text-zinc-500">
						stale in-progress tasks
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Today's Submissions */}
				<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 backdrop-blur-xl">
					<h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
						<CheckCircle2 className="h-4 w-4 text-emerald-400" />
						Today&apos;s Reports
					</h3>
					<div className="max-h-80 space-y-3 overflow-y-auto pr-1">
						{summary.submitted.length === 0 ? (
							<p className="rounded-lg border border-dashed border-zinc-800 px-4 py-8 text-center text-xs font-medium text-zinc-600">
								No reports submitted today yet.
							</p>
						) : (
							summary.submitted.map((entry) => (
								<div
									key={entry.userId}
									className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4 transition-colors hover:border-zinc-700"
								>
									<div className="mb-3 flex items-center gap-3">
										<Avatar name={entry.name} email={entry.email} size="sm" />
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-semibold text-zinc-100">
												{entry.name}
											</p>
											<p className="truncate text-[10px] text-zinc-500">
												{entry.email}
											</p>
										</div>
									</div>
									<div className="space-y-2 text-xs">
										<div>
											<span className="font-medium text-emerald-400">
												Completed:{" "}
											</span>
											<span className="text-zinc-300">
												{entry.report.completedWork}
											</span>
										</div>
										<div>
											<span className="font-medium text-violet-400">
												Next:{" "}
											</span>
											<span className="text-zinc-300">
												{entry.report.nextPlans}
											</span>
										</div>
										{entry.report.blockers && (
											<div>
												<span className="font-medium text-red-400">
													Blockers:{" "}
												</span>
												<span className="text-zinc-300">
													{entry.report.blockers}
												</span>
											</div>
										)}
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Who hasn't submitted */}
				<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 backdrop-blur-xl">
					<h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
						<AlertTriangle className="h-4 w-4 text-amber-400" />
						Pending Submissions
					</h3>
					<div className="space-y-3">
						{summary.notSubmitted.length === 0 ? (
							<p className="rounded-lg border border-dashed border-emerald-800/30 bg-emerald-500/5 px-4 py-8 text-center text-xs font-medium text-emerald-400">
								🎉 Everyone has submitted their report today!
							</p>
						) : (
							summary.notSubmitted.map((member) => (
								<div
									key={member.userId}
									className="flex items-center gap-3 rounded-lg border border-amber-500/10 bg-amber-500/5 px-4 py-3 transition-colors"
								>
									<Avatar name={member.name} email={member.email} size="sm" />
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium text-zinc-200">
											{member.name}
										</p>
										<p className="truncate text-[10px] text-zinc-500">
											{member.email}
										</p>
									</div>
									<Badge tone="warning">Pending</Badge>
								</div>
							))
						)}
					</div>
				</div>
			</div>

			{/* Member Workload */}
			{summary.memberWorkload.length > 0 && (
				<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 backdrop-blur-xl">
					<h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
						<Users className="h-4 w-4 text-violet-400" />
						Member Workload
					</h3>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-zinc-800 text-xs font-medium uppercase tracking-wider text-zinc-500">
									<th className="pb-3 pr-4 text-left">Member</th>
									<th className="pb-3 px-3 text-center">Todo</th>
									<th className="pb-3 px-3 text-center">In Progress</th>
									<th className="pb-3 px-3 text-center">Done</th>
									<th className="pb-3 pl-3 text-center">Overdue</th>
								</tr>
							</thead>
							<tbody>
								{summary.memberWorkload.map((member) => (
									<tr
										key={member.userId}
										className="border-b border-zinc-800/50 last:border-b-0"
									>
										<td className="py-3 pr-4">
											<div className="flex items-center gap-3">
												<Avatar
													name={member.name}
													email={member.email}
													size="sm"
												/>
												<span className="truncate font-medium text-zinc-200">
													{member.name}
												</span>
											</div>
										</td>
										<td className="py-3 px-3 text-center font-semibold text-zinc-400">
											{member.todo}
										</td>
										<td className="py-3 px-3 text-center font-semibold text-violet-300">
											{member.inProgress}
										</td>
										<td className="py-3 px-3 text-center font-semibold text-emerald-300">
											{member.done}
										</td>
										<td className="py-3 pl-3 text-center">
											{member.overdue > 0 ? (
												<Badge tone="danger">{member.overdue}</Badge>
											) : (
												<span className="font-semibold text-zinc-600">0</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Bottleneck Tasks */}
			{summary.bottleneckTasks.length > 0 && (
				<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 backdrop-blur-xl">
					<h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
						<Timer className="h-4 w-4 text-red-400" />
						Bottleneck Tasks
						<span className="text-xs font-normal text-zinc-500">
							— in progress the longest without updates
						</span>
					</h3>
					<div className="space-y-2">
						{summary.bottleneckTasks.map((task) => (
							<div
								key={task.id}
								className="flex items-center justify-between gap-4 rounded-lg border border-zinc-800/80 bg-zinc-950/60 px-4 py-3"
							>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold text-zinc-100">
										{task.title}
									</p>
									<p className="mt-0.5 text-xs text-zinc-500">
										{task.assignee
											? task.assignee.name || task.assignee.email
											: "Unassigned"}
									</p>
								</div>
								<Badge tone={task.daysSinceUpdate >= 3 ? "danger" : "warning"}>
									<Clock3 className="mr-1 h-3 w-3" />
									{task.daysSinceUpdate}d stale
								</Badge>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

// ─── My Daily Report Tab ─────────────────────────────────────────────
function MyReportView({ workspaceId }: { workspaceId: string }) {
	const { user } = useAuth();
	const today = new Date().toISOString().split("T")[0];

	const { data: myReports = [], isLoading } = useReports(workspaceId, {
		authorId: user?.id,
		limit: 8,
	});

	const submitReport = useSubmitReport(workspaceId);

	const todaysReport = myReports.find((r) => r.reportDate === today);

	const [completedWork, setCompletedWork] = useState("");
	const [nextPlans, setNextPlans] = useState("");
	const [blockers, setBlockers] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const [prevReport, setPrevReport] = useState<DailyReport | undefined>(
		undefined,
	);
	if (todaysReport !== prevReport) {
		setPrevReport(todaysReport);
		if (todaysReport) {
			setCompletedWork(todaysReport.completedWork);
			setNextPlans(todaysReport.nextPlans);
			setBlockers(todaysReport.blockers || "");
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!completedWork.trim() || !nextPlans.trim()) return;

		await submitReport.mutateAsync({
			completedWork: completedWork.trim(),
			nextPlans: nextPlans.trim(),
			blockers: blockers.trim() || null,
			reportDate: today,
		});
		setSubmitted(true);
		setTimeout(() => setSubmitted(false), 3000);
	};

	const previousReports = myReports.filter((r) => r.reportDate !== today);

	return (
		<div className="space-y-6">
			{/* Submit Form */}
			<form
				onSubmit={handleSubmit}
				className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 backdrop-blur-xl"
			>
				<h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-zinc-200">
					<FileText className="h-4 w-4 text-violet-400" />
					{todaysReport ? "Update Today's Report" : "Submit Today's Report"}
				</h3>
				<p className="mb-5 text-xs text-zinc-500">
					{new Date().toLocaleDateString(undefined, {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</p>

				<div className="space-y-4">
					<div className="space-y-2">
						<label
							htmlFor="completed-work"
							className="text-xs font-semibold uppercase tracking-wider text-emerald-400"
						>
							What I did today
						</label>
						<textarea
							id="completed-work"
							value={completedWork}
							onChange={(e) => setCompletedWork(e.target.value)}
							className="ot-input h-24 resize-none px-3 py-2 text-sm"
							placeholder="Describe the tasks you completed or worked on today..."
							required
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="next-plans"
							className="text-xs font-semibold uppercase tracking-wider text-violet-400"
						>
							What I&apos;m working on next
						</label>
						<textarea
							id="next-plans"
							value={nextPlans}
							onChange={(e) => setNextPlans(e.target.value)}
							className="ot-input h-24 resize-none px-3 py-2 text-sm"
							placeholder="What are your plans for tomorrow?"
							required
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="blockers"
							className="text-xs font-semibold uppercase tracking-wider text-red-400"
						>
							Blockers (optional)
						</label>
						<textarea
							id="blockers"
							value={blockers}
							onChange={(e) => setBlockers(e.target.value)}
							className="ot-input h-20 resize-none px-3 py-2 text-sm"
							placeholder="Anything blocking your progress?"
						/>
					</div>

					<div className="flex items-center gap-3">
						<Button
							type="submit"
							variant="primary"
							disabled={
								submitReport.isPending ||
								!completedWork.trim() ||
								!nextPlans.trim()
							}
						>
							{submitReport.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Send className="h-4 w-4" />
							)}
							{todaysReport ? "Update Report" : "Submit Report"}
						</Button>
						{submitted && (
							<span className="flex items-center gap-1 text-xs font-medium text-emerald-400 animate-in fade-in duration-300">
								<CheckCircle2 className="h-3.5 w-3.5" />
								Report saved!
							</span>
						)}
					</div>
				</div>
			</form>

			{/* Previous Reports */}
			<div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 backdrop-blur-xl">
				<h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
					<Clock3 className="h-4 w-4 text-zinc-400" />
					Previous Reports
				</h3>
				{isLoading ? (
					<div className="flex items-center gap-2 py-6 text-sm text-zinc-500">
						<Loader2 className="h-4 w-4 animate-spin" />
						Loading...
					</div>
				) : previousReports.length === 0 ? (
					<p className="rounded-lg border border-dashed border-zinc-800 px-4 py-8 text-center text-xs font-medium text-zinc-600">
						No previous reports found.
					</p>
				) : (
					<div className="space-y-3">
						{previousReports.map((report) => (
							<div
								key={report.id}
								className="rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4"
							>
								<p className="mb-2 text-xs font-semibold text-zinc-400">
									{formatRelativeDay(report.reportDate)}
								</p>
								<div className="space-y-1.5 text-xs">
									<div>
										<span className="font-medium text-emerald-400">
											Completed:{" "}
										</span>
										<span className="text-zinc-300">
											{report.completedWork}
										</span>
									</div>
									<div>
										<span className="font-medium text-violet-400">Next: </span>
										<span className="text-zinc-300">{report.nextPlans}</span>
									</div>
									{report.blockers && (
										<div>
											<span className="font-medium text-red-400">
												Blockers:{" "}
											</span>
											<span className="text-zinc-300">{report.blockers}</span>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

// ─── Main Page ───────────────────────────────────────────────────────
export function WorkspaceReports({ workspaceId }: WorkspaceReportsProps) {
	const [activeTab, setActiveTab] = useState<Tab>("dashboard");

	const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
		{ key: "dashboard", label: "Dashboard", icon: ClipboardList },
		{ key: "my-report", label: "My Daily Report", icon: FileText },
	];

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 md:p-8">
			<header className="mb-2">
				<h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-100">
					<ClipboardList className="h-6 w-6 text-violet-400" />
					Reports
				</h1>
				<p className="mt-1 text-sm text-zinc-400">
					Daily standups and team progress overview
				</p>
			</header>

			{/* Tab Switcher */}
			<div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 p-1">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					return (
						<button
							key={tab.key}
							type="button"
							onClick={() => setActiveTab(tab.key)}
							className={cn(
								"flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md px-4 text-xs font-semibold transition-colors",
								activeTab === tab.key
									? "bg-zinc-800 text-zinc-100"
									: "text-zinc-500 hover:text-zinc-200",
							)}
						>
							<Icon className="h-3.5 w-3.5" />
							{tab.label}
						</button>
					);
				})}
			</div>

			{activeTab === "dashboard" ? (
				<DashboardView workspaceId={workspaceId} />
			) : (
				<MyReportView workspaceId={workspaceId} />
			)}
		</div>
	);
}
