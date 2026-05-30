"use client";

import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ActivityTimeline } from "@/features/workspace/components/ActivityTimeline";
import { DashboardLayout } from "@/features/workspace/components/DashboardLayout";
import { KanbanBoard } from "@/features/workspace/components/KanbanBoard";
import { TaskModal } from "@/features/workspace/components/TaskModal";
import { WorkspaceSettings } from "@/features/workspace/components/WorkspaceSettings";
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
import { useUIStore } from "@/features/workspace/store/uiStore";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { AvatarWithRing } from "@/shared/ui/avatar/AvatarWithRing";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { cn } from "@/shared/ui/cn";
import {
	CheckCircle2,
	Circle,
	Clock3,
	Inbox,
	Kanban,
	List,
	Loader2,
	MessageSquare,
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
	const assignedTasks = tasks
		.filter((task) => task.assigneeId === userId && task.status !== "done")
		.slice(0, 5);
	const recentTasks = [...tasks]
		.sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
		)
		.slice(0, 4);
	const activeTasks = tasks.filter((task) => task.status === "in_progress");

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

				<ActivityTimeline
					workspaceId={workspaceId}
					workspaceName={workspaceName}
					tasks={tasks}
					onTaskClick={onTaskClick}
					compact
				/>
			</div>

			<aside className="min-w-0 space-y-4">
				<section className="rounded-2xl border border-zinc-900 bg-zinc-950/45 p-4 sm:p-5">
					<div className="mb-4">
						<p className="ot-label">Workspace Health</p>
						<h3 className="mt-1 text-sm font-semibold text-zinc-100">
							Task distribution
						</h3>
					</div>
					<div className="flex items-center gap-6">
						<AvatarWithRing
							name={workspaceName || "Workspace"}
							size="xl"
							tasks={{
								todo: tasks.filter((t) => t.status === "todo").length,
								inProgress: activeTasks.length,
								done: tasks.filter((t) => t.status === "done").length,
							}}
							className="ml-2"
						/>
						<div className="flex flex-col gap-2.5 flex-1">
							<div className="flex items-center justify-between text-xs">
								<div className="flex items-center gap-1.5">
									<div className="h-2 w-2 rounded-full bg-zinc-500" />
									<span className="text-zinc-400">Todo</span>
								</div>
								<span className="font-semibold text-zinc-100">
									{tasks.filter((t) => t.status === "todo").length}
								</span>
							</div>
							<div className="flex items-center justify-between text-xs">
								<div className="flex items-center gap-1.5">
									<div className="h-2 w-2 rounded-full bg-violet-400" />
									<span className="text-zinc-400">In progress</span>
								</div>
								<span className="font-semibold text-violet-300">
									{activeTasks.length}
								</span>
							</div>
							<div className="flex items-center justify-between text-xs">
								<div className="flex items-center gap-1.5">
									<div className="h-2 w-2 rounded-full bg-emerald-400" />
									<span className="text-zinc-400">Done</span>
								</div>
								<span className="font-semibold text-emerald-300">
									{tasks.filter((t) => t.status === "done").length}
								</span>
							</div>
						</div>
					</div>
				</section>

				<section className="rounded-2xl border border-zinc-900 bg-zinc-950/45 p-4">
					<div className="mb-3 flex items-center justify-between">
						<div>
							<p className="ot-label">Focus queue</p>
							<h3 className="mt-1 text-sm font-semibold text-zinc-100">
								Assigned to you
							</h3>
						</div>
						<Badge tone="accent">{assignedTasks.length}</Badge>
					</div>
					<div className="space-y-3">
						{assignedTasks.length === 0 ? (
							<p className="rounded-xl border border-dashed border-zinc-900 px-3 py-6 text-center text-xs text-zinc-600">
								No assigned tasks require attention.
							</p>
						) : (
							assignedTasks.map((task) => (
								<button
									key={task.id}
									type="button"
									onClick={() => onTaskClick(task.id)}
									className="flex w-full min-w-0 flex-col gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900/70 hover:shadow-(--ot-shadow-soft)"
								>
									<p className="line-clamp-2 text-sm font-semibold text-zinc-100">
										{task.title}
									</p>
									<div className="flex w-full items-center justify-between mt-1">
										<Badge tone="accent" className="text-[10px]">
											{task.status.replace("_", " ")}
										</Badge>
										{task.dueDate && (
											<span className="text-[10px] text-zinc-500">
												Due {new Date(task.dueDate).toLocaleDateString()}
											</span>
										)}
									</div>
								</button>
							))
						)}
					</div>
				</section>

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
								<div className="relative">
									<Avatar
										name={member.user.name}
										email={member.user.email}
										size="sm"
									/>
									<div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-[1.5px] border-zinc-950 bg-emerald-500" />
								</div>
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
						<MessageSquare className="h-4 w-4 text-violet-300" />
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
