"use client";

import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { ActivityTimeline } from "@/features/workspace/components/ActivityTimeline";
import { DashboardLayout } from "@/features/workspace/components/DashboardLayout";
import { TaskModal } from "@/features/workspace/components/TaskModal";
import {
	type Task,
	type TaskStatus,
	useTasks,
	useUpdateTask,
} from "@/features/workspace/hooks/useTaskData";
import {
	useProjects,
	useWorkspaces,
} from "@/features/workspace/hooks/useWorkspaceData";
import { useUIStore } from "@/features/workspace/store/uiStore";
import {
	CheckCircle2,
	Circle,
	Clock3,
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
	tone: string;
}> = [
	{
		value: "todo",
		label: "Todo",
		icon: Circle,
		tone: "text-zinc-400 border-zinc-700/80 bg-zinc-900/30",
	},
	{
		value: "in_progress",
		label: "In Progress",
		icon: Clock3,
		tone: "text-sky-300 border-sky-500/25 bg-sky-500/10",
	},
	{
		value: "done",
		label: "Done",
		icon: CheckCircle2,
		tone: "text-emerald-300 border-emerald-500/25 bg-emerald-500/10",
	},
	{
		value: "canceled",
		label: "Canceled",
		icon: XCircle,
		tone: "text-red-300 border-red-500/25 bg-red-500/10",
	},
];

export default function Home() {
	const {
		activeWorkspaceId,
		activeProjectId,
		selectedTaskId,
		isTaskModalOpen,
		isCreateTaskModalOpen,
		openTaskModal,
		closeTaskModal,
		openCreateTaskModal,
		closeCreateTaskModal,
	} = useUIStore();
	const { data: workspaces = [] } = useWorkspaces();
	const { data: projects = [] } = useProjects(activeWorkspaceId);
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
		updateTask.mutate({
			taskId: task.id,
			status,
		});
	};

	return (
		<AuthGuard>
			<DashboardLayout>
				{!activeWorkspaceId ? (
					<div className="flex flex-col items-center justify-center min-h-[50vh] text-center select-none animate-fade-in">
						<div className="h-16 w-16 bg-linear-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6">
							<Sparkles className="h-8 w-8 text-white animate-pulse" />
						</div>
						<h2 className="text-2xl font-bold text-white mb-2 tracking-wide">
							Welcome to oneTask
						</h2>
						<p className="text-sm text-zinc-500 max-w-sm mb-6 font-medium">
							Every action is an event. Select or launch a workspace in the
							sidebar to begin collaborating in realtime.
						</p>
					</div>
				) : !activeProjectId ? (
					<ActivityTimeline
						workspaceId={activeWorkspaceId}
						workspaceName={activeWorkspace?.name}
					/>
				) : (
					<div className="space-y-6 animate-fade-in">
						<div className="flex flex-col gap-4 border-b border-zinc-900/70 pb-5 md:flex-row md:items-center md:justify-between">
							<div>
								<h2 className="text-xl font-bold text-white">
									{activeProject?.name || "Project Tasks"}
								</h2>
								<p className="mt-1 text-xs font-medium text-zinc-500">
									{projectTasks.length} tasks grouped by current status.
								</p>
							</div>
							<button
								type="button"
								onClick={openCreateTaskModal}
								className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 transition-colors hover:bg-indigo-400"
							>
								<Plus className="h-4 w-4" />
								<span>New Task</span>
							</button>
						</div>

						{isLoadingTasks ? (
							<div className="flex items-center gap-2 py-10 text-sm font-medium text-zinc-500">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Loading tasks...</span>
							</div>
						) : projectTasks.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/20 px-6 py-12 text-center">
								<Circle className="mx-auto mb-3 h-6 w-6 text-zinc-600" />
								<p className="text-sm font-semibold text-zinc-300">
									No tasks in this project
								</p>
								<button
									type="button"
									onClick={openCreateTaskModal}
									className="mt-4 inline-flex items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-300 transition-colors hover:bg-zinc-900"
								>
									<Plus className="h-4 w-4" />
									<span>Create first task</span>
								</button>
							</div>
						) : (
							<div className="space-y-5">
								{STATUS_COLUMNS.map((column) => {
									const Icon = column.icon;
									const columnTasks = groupedTasks[column.value] || [];

									return (
										<section key={column.value} className="space-y-2">
											<div className="flex items-center gap-2 px-1">
												<span
													className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${column.tone}`}
												>
													<Icon className="h-4 w-4" />
												</span>
												<h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
													{column.label}
												</h3>
												<span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-zinc-500">
													{columnTasks.length}
												</span>
											</div>

											<div className="overflow-hidden rounded-2xl border border-zinc-900/80 bg-zinc-950/25 backdrop-blur-md">
												{columnTasks.length === 0 ? (
													<div className="px-4 py-4 text-xs font-medium text-zinc-600">
														No tasks
													</div>
												) : (
													columnTasks.map((task) => (
														<div
															key={task.id}
															className="grid w-full grid-cols-1 gap-3 border-b border-zinc-900/70 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-zinc-900/35 lg:grid-cols-[minmax(0,1fr)_180px_260px]"
														>
															<button
																type="button"
																onClick={() => openTaskModal(task.id)}
																className="grid min-w-0 grid-cols-1 gap-3 text-left lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_180px]"
															>
																<div className="min-w-0">
																	<p className="truncate text-sm font-semibold text-white">
																		{task.title}
																	</p>
																	<p className="mt-1 line-clamp-1 text-xs font-medium text-zinc-500">
																		{task.description || "No description"}
																	</p>
																</div>

																<div className="flex items-center text-xs font-medium text-zinc-500">
																	{task.assignee ? (
																		<span className="truncate">
																			{task.assignee.name ||
																				task.assignee.email}
																		</span>
																	) : (
																		<span>Unassigned</span>
																	)}
																</div>
															</button>

															<div className="flex flex-wrap items-center gap-1.5">
																{STATUS_COLUMNS.map((statusOption) => {
																	const StatusIcon = statusOption.icon;

																	return (
																		<button
																			key={statusOption.value}
																			type="button"
																			onClick={() =>
																				handleStatusChange(
																					task,
																					statusOption.value,
																				)
																			}
																			className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-[10px] font-bold transition-colors ${
																				task.status === statusOption.value
																					? statusOption.tone
																					: "border-zinc-800 bg-zinc-950/40 text-zinc-600 hover:text-zinc-300"
																			}`}
																			title={statusOption.label}
																		>
																			<StatusIcon className="h-3.5 w-3.5" />
																		</button>
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
