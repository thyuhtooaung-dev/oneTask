"use client";

import {
	Calendar,
	CheckCircle2,
	Circle,
	Clock3,
	Plus,
	User,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { Task, TaskStatus } from "../hooks/useTaskData";

interface KanbanBoardProps {
	tasks: Task[];
	onTaskClick: (taskId: string) => void;
	onStatusChange: (task: Task, status: TaskStatus) => void;
	onCreateTaskClick: () => void;
}

const STATUS_COLUMNS: Array<{
	value: TaskStatus;
	label: string;
	icon: React.ElementType;
	tone: string;
	indicatorColor: string;
	dragOverBg: string;
	dragOverBorder: string;
}> = [
	{
		value: "todo",
		label: "Todo",
		icon: Circle,
		tone: "text-zinc-400 border-zinc-700/80 bg-zinc-900/30",
		indicatorColor: "bg-zinc-700",
		dragOverBg: "bg-zinc-900/10",
		dragOverBorder:
			"border-zinc-700/60 shadow-[0_0_15px_rgba(113,113,122,0.05)]",
	},
	{
		value: "in_progress",
		label: "In Progress",
		icon: Clock3,
		tone: "text-sky-300 border-sky-500/25 bg-sky-500/10",
		indicatorColor: "bg-sky-400",
		dragOverBg: "bg-sky-500/5",
		dragOverBorder: "border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.05)]",
	},
	{
		value: "done",
		label: "Done",
		icon: CheckCircle2,
		tone: "text-emerald-300 border-emerald-500/25 bg-emerald-500/10",
		indicatorColor: "bg-emerald-400",
		dragOverBg: "bg-emerald-500/5",
		dragOverBorder:
			"border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]",
	},
	{
		value: "canceled",
		label: "Canceled",
		icon: XCircle,
		tone: "text-red-300 border-red-500/25 bg-red-500/10",
		indicatorColor: "bg-red-400",
		dragOverBg: "bg-red-500/5",
		dragOverBorder: "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]",
	},
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
	tasks,
	onTaskClick,
	onStatusChange,
	onCreateTaskClick,
}) => {
	const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
	const [activeDragOverColumn, setActiveDragOverColumn] =
		useState<TaskStatus | null>(null);

	// Group tasks by status
	const groupedTasks = STATUS_COLUMNS.reduce(
		(acc, col) => {
			acc[col.value] = tasks.filter((task) => task.status === col.value);
			return acc;
		},
		{} as Record<TaskStatus, Task[]>,
	);

	// Handle native HTML5 drag-and-drop
	const handleDragStart = (e: React.DragEvent, taskId: string) => {
		setDraggedTaskId(taskId);
		e.dataTransfer.setData("text/plain", taskId);
		e.dataTransfer.effectAllowed = "move";
		// Add transparent or custom image for better dragging effect if needed, but native is great
	};

	const handleDragEnd = () => {
		setDraggedTaskId(null);
		setActiveDragOverColumn(null);
	};

	const handleDragOver = (e: React.DragEvent, columnValue: TaskStatus) => {
		e.preventDefault();
		if (activeDragOverColumn !== columnValue) {
			setActiveDragOverColumn(columnValue);
		}
	};

	const handleDragLeave = (e: React.DragEvent) => {
		// Only trigger leave if we are exiting the actual column element
		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX;
		const y = e.clientY;

		if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
			setActiveDragOverColumn(null);
		}
	};

	const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
		e.preventDefault();
		const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
		setDraggedTaskId(null);
		setActiveDragOverColumn(null);

		if (!taskId) return;

		const targetTask = tasks.find((t) => t.id === taskId);
		if (targetTask && targetTask.status !== targetStatus) {
			onStatusChange(targetTask, targetStatus);
		}
	};

	const formatDate = (dateStr: string) => {
		try {
			const d = new Date(dateStr);
			return d.toLocaleDateString(undefined, {
				month: "short",
				day: "numeric",
			});
		} catch {
			return "";
		}
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start overflow-x-auto pb-6 select-none min-w-[900px] lg:min-w-0">
			{STATUS_COLUMNS.map((column) => {
				const colTasks = groupedTasks[column.value] || [];
				const isDragOver = activeDragOverColumn === column.value;
				const Icon = column.icon;

				return (
					<div
						key={column.value}
						onDragOver={(e) => handleDragOver(e, column.value)}
						onDragLeave={handleDragLeave}
						onDrop={(e) => handleDrop(e, column.value)}
						className={`flex flex-col rounded-2xl border bg-zinc-950/15 p-4 min-h-[550px] transition-all duration-300 ${
							isDragOver
								? `${column.dragOverBg} ${column.dragOverBorder}`
								: "border-zinc-900/60 hover:border-zinc-900/80"
						}`}
					>
						{/* Column Header */}
						<div className="flex items-center justify-between mb-4 px-1.5">
							<div className="flex items-center gap-2">
								<span
									className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${column.tone}`}
								>
									<Icon className="h-4 w-4" />
								</span>
								<h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
									{column.label}
								</h3>
								<span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-zinc-500 border border-zinc-800/40">
									{colTasks.length}
								</span>
							</div>

							{column.value === "todo" && (
								<button
									type="button"
									onClick={onCreateTaskClick}
									className="p-1 rounded-lg border border-zinc-900/40 bg-zinc-950/20 text-zinc-500 hover:text-white hover:border-zinc-800 transition-all duration-200"
									title="Create task in Todo"
								>
									<Plus className="h-3.5 w-3.5" />
								</button>
							)}
						</div>

						{/* Task Cards Column Body */}
						<div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1 scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent">
							{colTasks.length === 0 ? (
								<div className="h-28 rounded-xl border border-dashed border-zinc-900/60 bg-zinc-950/5 flex flex-col items-center justify-center text-center p-4">
									<p className="text-[11px] font-semibold text-zinc-600">
										No tasks here
									</p>
								</div>
							) : (
								colTasks.map((task) => {
									const isDraggingThis = draggedTaskId === task.id;
									return (
										<button
											key={task.id}
											type="button"
											draggable
											onDragStart={(e) => handleDragStart(e, task.id)}
											onDragEnd={handleDragEnd}
											onClick={() => onTaskClick(task.id)}
											className={`w-full group relative overflow-hidden rounded-xl border bg-zinc-950/40 backdrop-blur-md p-4 text-left shadow-md transition-all duration-300 cursor-grab hover:border-zinc-800 hover:bg-zinc-900/20 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/50 ${
												isDraggingThis
													? "opacity-40 border-indigo-500/35 bg-indigo-500/5 scale-[0.98]"
													: "border-zinc-900/80 hover:shadow-lg"
											}`}
										>
											{/* Ambient Indicator Glow Line */}
											<div
												className={`absolute top-0 left-0 w-full h-[2px] opacity-70 group-hover:opacity-100 transition-opacity duration-300 ${column.indicatorColor}`}
											/>

											{/* Card Header Title */}
											<h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors duration-200 line-clamp-2 pr-2 mb-1.5 leading-snug">
												{task.title}
											</h4>

											{/* Card Description */}
											<p className="text-xs font-medium text-zinc-500 line-clamp-3 mb-4 leading-relaxed">
												{task.description || "No description provided."}
											</p>

											{/* Card Footer */}
											<div className="flex items-center justify-between pt-2.5 border-t border-zinc-900/40 mt-auto">
												{/* Assignee Avatar */}
												<div className="flex items-center gap-1.5">
													{task.assignee ? (
														<div
															className="h-6 w-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center cursor-help"
															title={`Assigned to ${
																task.assignee.name || task.assignee.email
															}`}
														>
															{(task.assignee.name ||
																task.assignee.email)[0].toUpperCase()}
														</div>
													) : (
														<div
															className="h-6 w-6 rounded-full border border-dashed border-zinc-800 text-zinc-600 flex items-center justify-center cursor-help"
															title="Unassigned"
														>
															<User className="h-3 w-3" />
														</div>
													)}

													{task.assignee && (
														<span className="text-[10px] text-zinc-500 font-medium max-w-[80px] truncate">
															{task.assignee.name || "Assigned"}
														</span>
													)}
												</div>

												{/* Task Age/Date */}
												<div className="flex items-center gap-1 text-[10px] font-medium text-zinc-500">
													<Calendar className="h-3 w-3 text-zinc-600" />
													<span>{formatDate(task.createdAt)}</span>
												</div>
											</div>
										</button>
									);
								})
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
};
