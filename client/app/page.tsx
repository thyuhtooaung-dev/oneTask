"use client";

import { WorkspaceAnalytics } from "@/features/analytics/pages/WorkspaceAnalytics";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
	type Notification,
	useMarkNotificationAsRead,
	useNotifications,
} from "@/features/notifications/hooks/useNotifications";
import { usePresenceStore } from "@/features/realtime/store/presenceStore";
import { ActivityTimeline } from "@/features/workspace/components/ActivityTimeline";
import { DashboardLayout } from "@/features/workspace/components/DashboardLayout";
import { KanbanBoard } from "@/features/workspace/components/KanbanBoard";
import { TaskModal } from "@/features/workspace/components/TaskModal";
import { WorkspaceSettings } from "@/features/workspace/components/WorkspaceSettings";
import {
	type ActivityEvent,
	useActivities,
} from "@/features/workspace/hooks/useActivityData";
import {
	type Task,
	type TaskStatus,
	useTasks,
	useUpdateTask,
} from "@/features/workspace/hooks/useTaskData";
import {
	type WorkspaceMember,
	useProjects,
	useWorkspaceDetail,
	useWorkspaces,
} from "@/features/workspace/hooks/useWorkspaceData";
import { WorkspaceEventExplorer } from "@/features/workspace/pages/WorkspaceEventExplorer";
import { useUIStore } from "@/features/workspace/store/uiStore";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { cn } from "@/shared/ui/cn";
import {
	Activity,
	AlertCircle,
	Bell,
	Briefcase,
	CalendarClock,
	CheckCircle2,
	Circle,
	Clock3,
	Inbox,
	Kanban,
	List,
	Loader2,
	Plus,
	Sparkles,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useMemo } from "react";

const STATUS_COLUMNS: Array<{
	value: TaskStatus;
	label: string;
	icon: React.ElementType;
	tone: "neutral" | "accent" | "success" | "danger";
}> = [
	{ value: "todo", label: "Todo", icon: Circle, tone: "neutral" },
	{ value: "in_progress", label: "In progress", icon: Clock3, tone: "accent" },
	{ value: "done", label: "Done", icon: CheckCircle2, tone: "success" },
	{ value: "canceled", label: "Canceled", icon: XCircle, tone: "danger" },
];

function getGreeting(name?: string) {
	const hour = new Date().getHours();
	const daypart =
		hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
	return `${daypart}${name ? `, ${name}` : ""}`;
}

function isOverdue(task: Task) {
	if (!task.dueDate || task.status === "done" || task.status === "canceled") {
		return false;
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const dueDate = new Date(task.dueDate);
	dueDate.setHours(0, 0, 0, 0);
	return dueDate.getTime() < today.getTime();
}

function formatShortDate(value: string) {
	return new Date(value).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
}

function getNotificationCopy(notification: Notification) {
	const taskTitle = String(notification.payload?.taskTitle || "a task");

	if (notification.type === "task.assigned") {
		return {
			title: "New task assigned",
			subtitle: taskTitle,
		};
	}

	if (notification.type === "task.commented") {
		return {
			title: "New reply on your work",
			subtitle: taskTitle,
		};
	}

	if (notification.type === "comment.mentioned") {
		return {
			title: "You were mentioned",
			subtitle: taskTitle,
		};
	}

	if (notification.type === "task.status_changed") {
		return {
			title: "Task status changed",
			subtitle: taskTitle,
		};
	}

	return {
		title: "New notification",
		subtitle: taskTitle,
	};
}

function getActivityCopy(activity: ActivityEvent) {
	const actor = activity.actor?.name || activity.actor?.email || "You";
	const target =
		typeof activity.metadata?.taskTitle === "string"
			? activity.metadata.taskTitle
			: typeof activity.metadata?.projectName === "string"
				? activity.metadata.projectName
				: activity.entityType || "workspace";

	return {
		title: activity.type.replace(".", " "),
		subtitle: `${actor} · ${target}`,
	};
}

function WorkspaceHome({
	workspaceId,
	workspaceName,
	tasks,
	members,
	onTaskClick,
	onCreateTaskClick,
	userId,
	canCreateTask,
}: {
	workspaceId: string;
	workspaceName?: string;
	tasks: Task[];
	members: WorkspaceMember[];
	onTaskClick: (taskId: string) => void;
	onCreateTaskClick: () => void;
	userId?: string;
	canCreateTask: boolean;
}) {
	const { user } = useAuth();
	const { data: notifications = [] } = useNotifications();
	const markNotificationAsRead = useMarkNotificationAsRead();
	const { data: userActivities = [] } = useActivities(workspaceId, {
		actorId: userId,
		limit: 6,
	});
	const assignedTasks = tasks
		.filter((task) => task.assigneeId === userId && task.status !== "done")
		.sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
		);
	const recentTasks = [...tasks]
		.sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
		)
		.slice(0, 4);
	const activeTasks = tasks.filter((task) => task.status === "in_progress");
	const overdueAssignedTasks = assignedTasks.filter(isOverdue);
	const workspaceNotifications = notifications.filter(
		(notification) => notification.workspaceId === workspaceId,
	);
	const unreadWorkspaceNotifications = workspaceNotifications.filter(
		(notification) => !notification.read,
	);
	const isOnline = usePresenceStore((state) => state.onlineUserIds);
	const notificationTaskIds = new Set(
		unreadWorkspaceNotifications
			.map((notification) => notification.payload?.taskId)
			.filter((taskId): taskId is string => typeof taskId === "string"),
	);
	const attentionAssignedTasks = assignedTasks.filter(
		(task) =>
			task.status === "todo" &&
			!isOverdue(task) &&
			!notificationTaskIds.has(task.id),
	);
	const needsAttentionCount =
		unreadWorkspaceNotifications.length +
		overdueAssignedTasks.length +
		attentionAssignedTasks.length;
	const myWorkTasks = [
		...assignedTasks.filter((task) => task.status === "in_progress"),
		...assignedTasks.filter((task) => task.status !== "in_progress"),
	].slice(0, 5);

	const openNotification = (notification: Notification) => {
		if (!notification.read) {
			markNotificationAsRead.mutate(notification.id);
		}

		const taskId = notification.payload?.taskId;
		if (typeof taskId === "string") {
			onTaskClick(taskId);
		}
	};

	return (
		<div className="mx-auto grid w-full max-w-[1600px] min-w-0 gap-5 lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
			<div className="min-w-0 space-y-8">
				<section className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
							{workspaceName || "Workspace"}
						</h2>
						<Button
							variant="primary"
							onClick={onCreateTaskClick}
							disabled={!canCreateTask}
							title={canCreateTask ? "Create task" : "Create a project first"}
						>
							<Plus className="h-4 w-4" />
							New task
						</Button>
					</div>

					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<div className="rounded-xl border border-zinc-900/80 bg-zinc-950/45 p-4 sm:p-5 shadow-(--ot-shadow-soft)">
							<p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
								Assigned Tasks
							</p>
							<p className="mt-1.5 text-xl font-semibold text-zinc-100">
								{assignedTasks.length}
							</p>
						</div>
						<div className="rounded-xl border border-zinc-900/80 bg-zinc-950/45 p-4 sm:p-5 shadow-(--ot-shadow-soft)">
							<p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
								In Progress
							</p>
							<p className="mt-1.5 text-xl font-semibold text-violet-300">
								{activeTasks.length}
							</p>
						</div>
						<div className="rounded-xl border border-zinc-900/80 bg-zinc-950/45 p-4 sm:p-5 shadow-(--ot-shadow-soft)">
							<p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
								Completed
							</p>
							<p className="mt-1.5 text-xl font-semibold text-emerald-300">
								{tasks.filter((t) => t.status === "done").length}
							</p>
						</div>
						<div className="rounded-xl border border-zinc-900/80 bg-zinc-950/45 p-4 sm:p-5 shadow-(--ot-shadow-soft)">
							<p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
								Members
							</p>
							<p className="mt-1.5 text-xl font-semibold text-zinc-100">
								{members.length}
							</p>
						</div>
					</div>
				</section>

				<section className="space-y-4">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="ot-label">Personal inbox</p>
							<h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-100">
								{getGreeting(user?.name || user?.email)}
							</h3>
						</div>
						<Badge tone={needsAttentionCount > 0 ? "warning" : "success"}>
							Needs Attention ({needsAttentionCount})
						</Badge>
					</div>

					<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)]">
						<section className="rounded-xl border border-zinc-900 bg-zinc-950/45 p-4">
							<div className="mb-3 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<AlertCircle className="h-4 w-4 text-amber-300" />
									<h4 className="text-sm font-semibold text-zinc-100">
										Needs Attention
									</h4>
								</div>
								<Badge tone={needsAttentionCount > 0 ? "warning" : "neutral"}>
									{needsAttentionCount}
								</Badge>
							</div>

							<div className="space-y-2">
								{unreadWorkspaceNotifications
									.slice(0, 4)
									.map((notification) => {
										const copy = getNotificationCopy(notification);

										return (
											<button
												key={notification.id}
												type="button"
												onClick={() => openNotification(notification)}
												className="grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-zinc-900 bg-zinc-950/70 px-3 py-2.5 text-left transition-colors hover:border-zinc-800 hover:bg-zinc-900/70"
											>
												<span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-300">
													<Bell className="h-4 w-4" />
												</span>
												<span className="min-w-0">
													<span className="block truncate text-sm font-semibold text-zinc-100">
														{copy.title}
													</span>
													<span className="mt-0.5 block truncate text-xs text-zinc-500">
														{copy.subtitle}
													</span>
												</span>
												<span className="text-[10px] font-medium text-zinc-600">
													{formatShortDate(notification.createdAt)}
												</span>
											</button>
										);
									})}

								{overdueAssignedTasks.slice(0, 3).map((task) => (
									<button
										key={`overdue-${task.id}`}
										type="button"
										onClick={() => onTaskClick(task.id)}
										className="grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-red-500/15 bg-red-500/5 px-3 py-2.5 text-left transition-colors hover:border-red-500/25 hover:bg-red-500/10"
									>
										<span className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-300">
											<CalendarClock className="h-4 w-4" />
										</span>
										<span className="min-w-0">
											<span className="block truncate text-sm font-semibold text-zinc-100">
												{task.title}
											</span>
											<span className="mt-0.5 block truncate text-xs text-red-300/80">
												Overdue since{" "}
												{task.dueDate
													? formatShortDate(task.dueDate)
													: "earlier"}
											</span>
										</span>
										<Badge tone="danger">Overdue</Badge>
									</button>
								))}

								{attentionAssignedTasks.slice(0, 3).map((task) => (
									<button
										key={`assigned-${task.id}`}
										type="button"
										onClick={() => onTaskClick(task.id)}
										className="grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-zinc-900 bg-zinc-950/70 px-3 py-2.5 text-left transition-colors hover:border-zinc-800 hover:bg-zinc-900/70"
									>
										<span className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-300">
											<Briefcase className="h-4 w-4" />
										</span>
										<span className="min-w-0">
											<span className="block truncate text-sm font-semibold text-zinc-100">
												{task.title}
											</span>
											<span className="mt-0.5 block truncate text-xs text-zinc-500">
												Assigned to you
											</span>
										</span>
										<Badge tone="warning">New</Badge>
									</button>
								))}

								{needsAttentionCount === 0 && (
									<p className="rounded-lg border border-dashed border-zinc-900 px-3 py-8 text-center text-xs font-medium text-zinc-600">
										Nothing needs attention right now.
									</p>
								)}
							</div>
						</section>

						<section className="rounded-xl border border-zinc-900 bg-zinc-950/45 p-4">
							<div className="mb-3 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Briefcase className="h-4 w-4 text-violet-300" />
									<h4 className="text-sm font-semibold text-zinc-100">
										My Work
									</h4>
								</div>
								<Badge tone="accent">{assignedTasks.length}</Badge>
							</div>

							<div className="space-y-2">
								{myWorkTasks.map((task) => (
									<button
										key={task.id}
										type="button"
										onClick={() => onTaskClick(task.id)}
										className="flex w-full min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-zinc-900/70"
									>
										<span className="min-w-0">
											<span className="block truncate text-sm font-semibold text-zinc-200">
												{task.title}
											</span>
											<span className="mt-0.5 block truncate text-xs text-zinc-600">
												{task.dueDate
													? `Due ${formatShortDate(task.dueDate)}`
													: "No due date"}
											</span>
										</span>
										<Badge
											className="shrink-0"
											tone={
												STATUS_COLUMNS.find(
													(item) => item.value === task.status,
												)?.tone || "neutral"
											}
										>
											{task.status.replace("_", " ")}
										</Badge>
									</button>
								))}

								{myWorkTasks.length === 0 && (
									<p className="rounded-lg border border-dashed border-zinc-900 px-3 py-8 text-center text-xs font-medium text-zinc-600">
										No assigned work is active.
									</p>
								)}
							</div>
						</section>
					</div>

					<section className="rounded-xl border border-zinc-900 bg-zinc-950/45 p-4">
						<div className="mb-3 flex items-center gap-2">
							<Activity className="h-4 w-4 text-emerald-300" />
							<h4 className="text-sm font-semibold text-zinc-100">
								Recent Activity By You
							</h4>
						</div>
						<div className="grid gap-2 md:grid-cols-2">
							{userActivities.slice(0, 4).map((activity) => {
								const copy = getActivityCopy(activity);

								return (
									<div
										key={activity.id}
										className="rounded-lg border border-zinc-900 bg-zinc-950/55 px-3 py-2.5"
									>
										<div className="flex items-center justify-between gap-3">
											<p className="truncate text-sm font-semibold capitalize text-zinc-200">
												{copy.title}
											</p>
											<span className="shrink-0 text-[10px] font-medium text-zinc-600">
												{formatShortDate(activity.createdAt)}
											</span>
										</div>
										<p className="mt-1 truncate text-xs text-zinc-600">
											{copy.subtitle}
										</p>
									</div>
								);
							})}

							{userActivities.length === 0 && (
								<p className="rounded-lg border border-dashed border-zinc-900 px-3 py-8 text-center text-xs font-medium text-zinc-600 md:col-span-2">
									No recent activity is tied to you yet.
								</p>
							)}
						</div>
					</section>
				</section>

				<ActivityTimeline
					workspaceId={workspaceId}
					workspaceName={workspaceName}
					tasks={tasks}
					onTaskClick={onTaskClick}
					compact
				/>
			</div>

			<aside className="min-w-0 space-y-4">
				<section className="rounded-2xl border border-zinc-900 bg-zinc-950/45 p-4">
					<div className="mb-3 flex items-center justify-between">
						<div>
							<p className="ot-label">Team</p>
							<h3 className="mt-1 text-sm font-semibold text-zinc-100">
								Active members
							</h3>
						</div>
						<Badge tone="neutral">{members.length}</Badge>
					</div>
					<div className="space-y-3">
						{members.slice(0, 5).map((member) => (
							<div key={member.id} className="flex items-center gap-3">
								<Avatar
									name={member.user.name}
									email={member.user.email}
									size="sm"
									isOnline={isOnline.has(member.user.id)}
								/>
								<div className="min-w-0 flex-1">
									<p className="truncate text-xs font-medium text-zinc-200">
										{member.user.name || member.user.email}
									</p>
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="rounded-2xl border border-zinc-900 bg-zinc-950/45 p-4">
					<div className="mb-3 flex items-center gap-2">
						<Clock3 className="h-4 w-4 text-violet-300" />
						<h3 className="text-sm font-semibold text-zinc-100">
							Recent task surfaces
						</h3>
					</div>
					<div className="space-y-2">
						{recentTasks.map((task) => (
							<button
								key={task.id}
								type="button"
								onClick={() => onTaskClick(task.id)}
								className="flex w-full min-w-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-zinc-900/70"
							>
								<span className="truncate text-sm font-medium text-zinc-300">
									{task.title}
								</span>
								<Badge
									className="shrink-0"
									tone={
										STATUS_COLUMNS.find((item) => item.value === task.status)
											?.tone || "neutral"
									}
								>
									{task.status.replace("_", " ")}
								</Badge>
							</button>
						))}
						{recentTasks.length === 0 && (
							<p className="px-3 py-4 text-xs text-zinc-600">
								No task activity yet.
							</p>
						)}
					</div>
				</section>
			</aside>
		</div>
	);
}

export default function Home() {
	const { user } = useAuth();
	const {
		activeWorkspaceId,
		activeProjectId,
		selectedTaskId,
		isTaskModalOpen,
		isCreateTaskModalOpen,
		viewMode,
		showSettings,
		showActivityExplorer,
		showAnalytics,
		openTaskModal,
		closeTaskModal,
		openCreateTaskModal,
		closeCreateTaskModal,
		setViewMode,
		setActiveProjectId,
	} = useUIStore();
	const { data: workspaces = [] } = useWorkspaces();
	const { data: projects = [] } = useProjects(activeWorkspaceId);
	const { data: workspaceDetail } = useWorkspaceDetail(activeWorkspaceId);
	const { data: tasks = [], isLoading: isLoadingTasks } =
		useTasks(activeWorkspaceId);
	const updateTask = useUpdateTask(activeWorkspaceId);

	const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
	const activeProject = projects.find((p) => p.id === activeProjectId);
	const projectTasks = useMemo(
		() => tasks.filter((task) => task.projectId === activeProjectId),
		[tasks, activeProjectId],
	);
	const selectedTask = tasks.find((task) => task.id === selectedTaskId);
	const groupedTasks = useMemo(
		() =>
			STATUS_COLUMNS.reduce(
				(acc, column) => {
					acc[column.value] = projectTasks.filter(
						(task) => task.status === column.value,
					);
					return acc;
				},
				{} as Record<TaskStatus, Task[]>,
			),
		[projectTasks],
	);

	const handleStatusChange = (task: Task, status: TaskStatus) => {
		if (task.status === status) return;
		updateTask.mutate({ taskId: task.id, status });
	};
	const handleCreateTaskFromWorkspaceHome = () => {
		const firstProject = projects[0];
		if (firstProject) setActiveProjectId(firstProject.id);
		openCreateTaskModal();
	};

	return (
		<AuthGuard>
			<DashboardLayout>
				{!activeWorkspaceId ? (
					<div className="flex min-h-[64vh] items-center justify-center">
						<div className="max-w-md text-center">
							<div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-[0_16px_48px_rgba(124,58,237,0.28)]">
								<Sparkles className="h-5 w-5" />
							</div>
							<p className="ot-label">Start collaborating</p>
							<h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
								Choose a workspace
							</h2>
							<p className="mt-2 text-sm leading-6 text-zinc-500">
								oneTask turns actions into events so teams can keep awareness
								without dashboard clutter.
							</p>
						</div>
					</div>
				) : showSettings ? (
					<WorkspaceSettings workspaceId={activeWorkspaceId} />
				) : showActivityExplorer ? (
					<WorkspaceEventExplorer workspaceId={activeWorkspaceId} />
				) : showAnalytics ? (
					<WorkspaceAnalytics workspaceId={activeWorkspaceId} />
				) : !activeProjectId ? (
					<WorkspaceHome
						workspaceId={activeWorkspaceId}
						workspaceName={activeWorkspace?.name}
						tasks={tasks}
						members={workspaceDetail?.members || []}
						onTaskClick={openTaskModal}
						onCreateTaskClick={handleCreateTaskFromWorkspaceHome}
						userId={user?.id}
						canCreateTask={projects.length > 0}
					/>
				) : (
					<div className="space-y-5 animate-fade-in">
						<div className="flex flex-col gap-4 rounded-2xl border border-zinc-900 bg-zinc-950/45 p-4 md:flex-row md:items-center md:justify-between lg:p-5">
							<div className="min-w-0">
								<p className="ot-label">Project surface</p>
								<h2 className="mt-1 wrap-break-word text-2xl font-semibold tracking-tight text-zinc-100">
									{activeProject?.name || "Project tasks"}
								</h2>
								<p className="mt-1 text-sm leading-6 text-zinc-500">
									{projectTasks.length} tasks grouped by workflow state.
								</p>
							</div>

							<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
								<div className="grid grid-cols-2 rounded-lg border border-zinc-800 bg-zinc-950 p-1 sm:flex sm:items-center">
									<button
										type="button"
										onClick={() => setViewMode("list")}
										className={cn(
											"flex min-h-10 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors",
											viewMode === "list"
												? "bg-zinc-800 text-zinc-100"
												: "text-zinc-500 hover:text-zinc-200",
										)}
									>
										<List className="h-3.5 w-3.5" />
										List
									</button>
									<button
										type="button"
										onClick={() => setViewMode("board")}
										className={cn(
											"flex min-h-10 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors",
											viewMode === "board"
												? "bg-zinc-800 text-zinc-100"
												: "text-zinc-500 hover:text-zinc-200",
										)}
									>
										<Kanban className="h-3.5 w-3.5" />
										Board
									</button>
								</div>

								<Button
									variant="primary"
									onClick={openCreateTaskModal}
									className="w-full sm:w-auto"
								>
									<Plus className="h-4 w-4" />
									New task
								</Button>
							</div>
						</div>

						{isLoadingTasks ? (
							<div className="flex items-center gap-2 rounded-xl border border-zinc-900 bg-zinc-950/45 px-4 py-10 text-sm font-medium text-zinc-500">
								<Loader2 className="h-4 w-4 animate-spin" />
								Loading tasks
							</div>
						) : projectTasks.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/35 px-6 py-12 text-center">
								<Inbox className="mx-auto mb-3 h-6 w-6 text-zinc-700" />
								<p className="text-sm font-semibold text-zinc-300">
									No tasks in this project
								</p>
								<Button
									variant="secondary"
									className="mt-4"
									onClick={openCreateTaskModal}
								>
									<Plus className="h-4 w-4" />
									Create first task
								</Button>
							</div>
						) : viewMode === "board" ? (
							<KanbanBoard
								tasks={projectTasks}
								onTaskClick={openTaskModal}
								onStatusChange={handleStatusChange}
								onCreateTaskClick={openCreateTaskModal}
							/>
						) : (
							<div className="space-y-4">
								{STATUS_COLUMNS.map((column) => {
									const Icon = column.icon;
									const columnTasks = groupedTasks[column.value] || [];

									return (
										<section key={column.value} className="space-y-2">
											<div className="flex items-center gap-2 px-1">
												<Badge tone={column.tone}>
													<Icon className="h-3 w-3" />
													{column.label}
												</Badge>
												<span className="text-[11px] font-bold text-zinc-600">
													{columnTasks.length}
												</span>
											</div>

											<div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950/45">
												{columnTasks.length === 0 ? (
													<div className="px-4 py-4 text-xs font-medium text-zinc-600">
														No tasks
													</div>
												) : (
													columnTasks.map((task) => (
														<div
															key={task.id}
															className="grid gap-3 border-b border-zinc-900 px-3 py-3 last:border-b-0 hover:bg-zinc-900/45 sm:px-4 md:grid-cols-[minmax(0,1fr)_160px] lg:grid-cols-[minmax(0,1fr)_180px_220px]"
														>
															<button
																type="button"
																onClick={() => openTaskModal(task.id)}
																className="min-h-10 min-w-0 text-left"
															>
																<p className="line-clamp-2 text-sm font-semibold text-zinc-100">
																	{task.title}
																</p>
																<p className="mt-1 line-clamp-1 text-xs text-zinc-500">
																	{task.description || "No description"}
																</p>
															</button>

															<div className="flex min-w-0 items-center text-xs font-medium text-zinc-500">
																<span className="truncate">
																	{task.assignee?.name ||
																		task.assignee?.email ||
																		"Unassigned"}
																</span>
															</div>

															<div className="flex flex-wrap items-center gap-1.5 md:col-span-2 lg:col-span-1">
																{STATUS_COLUMNS.map((statusOption) => {
																	const StatusIcon = statusOption.icon;

																	return (
																		<Button
																			key={statusOption.value}
																			type="button"
																			variant={
																				task.status === statusOption.value
																					? "secondary"
																					: "ghost"
																			}
																			size="icon"
																			onClick={() =>
																				handleStatusChange(
																					task,
																					statusOption.value,
																				)
																			}
																			title={statusOption.label}
																		>
																			<StatusIcon className="h-3.5 w-3.5" />
																		</Button>
																	);
																})}
															</div>
														</div>
													))
												)}
											</div>
										</section>
									);
								})}
							</div>
						)}
					</div>
				)}

				<TaskModal
					isOpen={isCreateTaskModalOpen}
					mode="create"
					workspaceId={activeWorkspaceId}
					projectId={activeProjectId}
					onClose={closeCreateTaskModal}
				/>
				<TaskModal
					isOpen={isTaskModalOpen}
					mode="edit"
					workspaceId={activeWorkspaceId}
					projectId={activeProjectId}
					task={selectedTask}
					onClose={closeTaskModal}
				/>
			</DashboardLayout>
		</AuthGuard>
	);
}
