"use client";

import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { cn } from "@/shared/ui/cn";
import { DropdownMenu } from "@/shared/ui/dropdown-menu/DropdownMenu";
import { TaskCard } from "@/shared/ui/task-card/TaskCard";
import {
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	Circle,
	Clock3,
	Plus,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import type { Task, TaskStatus } from "../hooks/useTaskData";

interface KanbanBoardProps {
	tasks: Task[];
	onTaskClick: (taskId: string) => void;
	onStatusChange: (task: Task, status: TaskStatus) => void;
	onCreateTaskClick: () => void;
	currentUserId?: string;
	currentUserRole?: string;
}

const STATUS_COLUMNS: Array<{
	value: TaskStatus;
	label: string;
	icon: React.ElementType;
	tone: "neutral" | "accent" | "success" | "danger";
	accentClassName: string;
}> = [
	{
		value: "todo",
		label: "Todo",
		icon: Circle,
		tone: "neutral",
		accentClassName: "bg-surface-600",
	},
	{
		value: "in_progress",
		label: "In progress",
		icon: Clock3,
		tone: "accent",
		accentClassName: "bg-primary-400",
	},
	{
		value: "done",
		label: "Done",
		icon: CheckCircle2,
		tone: "success",
		accentClassName: "bg-success-400",
	},
	{
		value: "canceled",
		label: "Canceled",
		icon: XCircle,
		tone: "danger",
		accentClassName: "bg-danger-400",
	},
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
	tasks,
	onTaskClick,
	onStatusChange,
	onCreateTaskClick,
	currentUserId,
	currentUserRole,
}) => {
	const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
	const [activeDragOverColumn, setActiveDragOverColumn] =
		useState<TaskStatus | null>(null);

	const [collapsedColumns, setCollapsedColumns] = useState<
		Record<TaskStatus, boolean>
	>({
		todo: false,
		in_progress: false,
		done: false,
		canceled: false,
	});

	const toggleColumn = (status: TaskStatus) => {
		setCollapsedColumns((prev) => ({
			...prev,
			[status]: !prev[status],
		}));
	};

	const groupedTasks = useMemo(
		() =>
			STATUS_COLUMNS.reduce(
				(acc, column) => {
					acc[column.value] = tasks.filter(
						(task) => task.status === column.value,
					);
					return acc;
				},
				{} as Record<TaskStatus, Task[]>,
			),
		[tasks],
	);

	const handleDragStart = (event: React.DragEvent, taskId: string) => {
		setDraggedTaskId(taskId);
		event.dataTransfer.setData("text/plain", taskId);
		event.dataTransfer.effectAllowed = "move";
	};

	const handleDrop = (event: React.DragEvent, targetStatus: TaskStatus) => {
		event.preventDefault();
		const taskId = event.dataTransfer.getData("text/plain") || draggedTaskId;
		setDraggedTaskId(null);
		setActiveDragOverColumn(null);

		const task = tasks.find((item) => item.id === taskId);
		if (task && task.status !== targetStatus)
			onStatusChange(task, targetStatus);
	};

	return (
		<>
			<div className="space-y-4 md:hidden">
				{STATUS_COLUMNS.map((column) => {
					const columnTasks = groupedTasks[column.value] || [];
					const Icon = column.icon;

					return (
						<section
							key={column.value}
							className="rounded-2xl border border-surface-900 bg-surface-950/35 p-3"
						>
							<div className="mb-3 flex items-center justify-between gap-3">
								<div className="flex items-center gap-2">
									<Badge tone={column.tone}>
										<Icon className="h-3 w-3" />
										{column.label}
									</Badge>
									<span className="text-[11px] font-bold text-surface-600">
										{columnTasks.length}
									</span>
								</div>
								{column.value === "todo" && (
									<Button
										variant="ghost"
										size="icon"
										onClick={onCreateTaskClick}
										title="Create task"
									>
										<Plus className="h-4 w-4" />
									</Button>
								)}
							</div>

							<div className="space-y-3">
								{columnTasks.length === 0 ? (
									<div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-surface-900 bg-surface-950/30 px-4 text-center text-xs font-medium text-surface-600">
										No tasks
									</div>
								) : (
									columnTasks.map((task) => {
										const isReporter = task.reporterId === currentUserId;
										const isAssignee = task.assigneeId === currentUserId;
										const canEditProgress =
											currentUserRole === "OWNER" ||
											currentUserRole === "ADMIN" ||
											isReporter ||
											isAssignee;

										return (
											<div key={task.id} className="space-y-2">
												<TaskCard
													title={task.title}
													description={task.description}
													assigneeName={task.assignee?.name}
													assigneeEmail={task.assignee?.email}
													priority={task.priority}
													dueDate={task.dueDate}
													createdAt={task.createdAt}
													onClick={() => onTaskClick(task.id)}
													accentClassName={column.accentClassName}
												/>
												{canEditProgress && (
													<DropdownMenu.Root>
														<DropdownMenu.Trigger asChild>
															<button
																type="button"
																className="ot-input flex min-h-10 items-center justify-between gap-3 px-3 text-left text-xs font-semibold"
															>
																<span className="truncate">
																	Move to {column.label}
																</span>
																<ChevronDown className="h-4 w-4 shrink-0 text-surface-600" />
															</button>
														</DropdownMenu.Trigger>
														<DropdownMenu.Content
															align="start"
															className="w-(--radix-dropdown-menu-trigger-width) max-w-[calc(100vw-2rem)]"
														>
															<DropdownMenu.Label>Move task</DropdownMenu.Label>
															<DropdownMenu.RadioGroup
																value={task.status}
																onValueChange={(value) =>
																	onStatusChange(task, value as TaskStatus)
																}
															>
																{STATUS_COLUMNS.map((statusOption) => (
																	<DropdownMenu.RadioItem
																		key={statusOption.value}
																		value={statusOption.value}
																	>
																		{statusOption.label}
																	</DropdownMenu.RadioItem>
																))}
															</DropdownMenu.RadioGroup>
														</DropdownMenu.Content>
													</DropdownMenu.Root>
												)}
											</div>
										);
									})
								)}
							</div>
						</section>
					);
				})}
			</div>

			<div className="hidden overflow-x-auto pb-4 md:block">
				<div className="grid min-w-[1120px] grid-cols-4 gap-4 xl:min-w-0">
					{STATUS_COLUMNS.map((column) => {
						const columnTasks = groupedTasks[column.value] || [];
						const Icon = column.icon;
						const isActiveDrop = activeDragOverColumn === column.value;

						return (
							<section
								key={column.value}
								onDragOver={(event) => {
									event.preventDefault();
									setActiveDragOverColumn(column.value);
								}}
								onDragLeave={() => setActiveDragOverColumn(null)}
								onDrop={(event) => handleDrop(event, column.value)}
								className={cn(
									"flex flex-col rounded-2xl border transition-all duration-150",
									collapsedColumns[column.value]
										? "h-14 overflow-hidden bg-surface-950/20"
										: "min-h-[520px] bg-surface-950/35 p-3",
									isActiveDrop && !collapsedColumns[column.value]
										? "border-primary-500/35 bg-primary-500/5"
										: "border-surface-900",
								)}
							>
								<div
									className={cn(
										"sticky top-0 z-10 flex items-center justify-between gap-3 bg-surface-950/95",
										collapsedColumns[column.value]
											? "px-3 py-3"
											: "mb-3 px-1 py-1",
									)}
								>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() => toggleColumn(column.value)}
											className="text-surface-500 hover:text-surface-300 flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
										>
											{collapsedColumns[column.value] ? (
												<ChevronRight className="h-4 w-4" />
											) : (
												<ChevronDown className="h-4 w-4" />
											)}
										</button>
										<Badge tone={column.tone}>
											<Icon className="h-3 w-3" />
											{column.label}
										</Badge>
										<span className="text-[11px] font-bold text-surface-600">
											{columnTasks.length}
										</span>
									</div>
									{column.value === "todo" && (
										<Button
											variant="ghost"
											size="icon"
											onClick={onCreateTaskClick}
											title="Create task"
										>
											<Plus className="h-4 w-4" />
										</Button>
									)}
								</div>

								{!collapsedColumns[column.value] && (
									<div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
										{columnTasks.length === 0 ? (
											<div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-surface-900 bg-surface-950/30 text-xs font-medium text-surface-600">
												Drop tasks here
											</div>
										) : (
											columnTasks.map((task) => {
												const isReporter = task.reporterId === currentUserId;
												const isAssignee = task.assigneeId === currentUserId;
												const canEditProgress =
													currentUserRole === "OWNER" ||
													currentUserRole === "ADMIN" ||
													isReporter ||
													isAssignee;

												return (
													<TaskCard
														key={task.id}
														title={task.title}
														description={task.description}
														assigneeName={task.assignee?.name}
														assigneeEmail={task.assignee?.email}
														priority={task.priority}
														dueDate={task.dueDate}
														createdAt={task.createdAt}
														onClick={() => onTaskClick(task.id)}
														draggable={canEditProgress}
														onDragStart={(event) =>
															handleDragStart(event, task.id)
														}
														onDragEnd={() => {
															setDraggedTaskId(null);
															setActiveDragOverColumn(null);
														}}
														isDragging={draggedTaskId === task.id}
														accentClassName={column.accentClassName}
													/>
												);
											})
										)}
									</div>
								)}
							</section>
						);
					})}
				</div>
			</div>
		</>
	);
};
