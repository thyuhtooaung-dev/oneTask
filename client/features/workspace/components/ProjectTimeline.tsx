"use client";

import { cn } from "@/shared/ui/cn";
import {
	addDays,
	differenceInDays,
	format,
	isToday,
	startOfDay,
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useMemo } from "react";
import type { Task } from "../hooks/useTaskData";

interface ProjectTimelineProps {
	tasks: Task[];
	onTaskClick: (taskId: string) => void;
}

export function ProjectTimeline({ tasks, onTaskClick }: ProjectTimelineProps) {
	const { minDate, days, columns } = useMemo(() => {
		let min = new Date();
		let max = new Date();

		if (tasks.length > 0) {
			const startDates = tasks.map((t) =>
				startOfDay(new Date(t.startDate || t.createdAt)),
			);
			const endDates = tasks.map((t) =>
				startOfDay(new Date(t.dueDate || t.startDate || t.createdAt)),
			);

			min = new Date(Math.min(...startDates.map((d) => d.getTime())));
			max = new Date(Math.max(...endDates.map((d) => d.getTime())));
		}

		// Add padding: 7 days before, 14 days after
		min = addDays(min, -7);
		max = addDays(max, 14);

		const totalDays = differenceInDays(max, min) + 1;
		const dates = Array.from({ length: totalDays }).map((_, i) =>
			addDays(min, i),
		);

		return {
			minDate: min,
			maxDate: max,
			days: dates,
			columns: totalDays,
		};
	}, [tasks]);

	// Group days by month for the top header
	const months = useMemo(() => {
		const result: { monthYear: string; colSpan: number }[] = [];
		let currentMonth = "";
		let currentSpan = 0;

		for (const day of days) {
			const monthYear = format(day, "MMMM yyyy");
			if (monthYear !== currentMonth) {
				if (currentMonth) {
					result.push({ monthYear: currentMonth, colSpan: currentSpan });
				}
				currentMonth = monthYear;
				currentSpan = 1;
			} else {
				currentSpan++;
			}
		}
		if (currentMonth) {
			result.push({ monthYear: currentMonth, colSpan: currentSpan });
		}
		return result;
	}, [days]);

	if (tasks.length === 0) {
		return (
			<div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border border-zinc-900 bg-zinc-950/45 text-center">
				<CalendarIcon className="mb-4 h-8 w-8 text-zinc-600" />
				<h3 className="text-lg font-semibold text-zinc-300">
					No tasks to display
				</h3>
				<p className="mt-2 text-sm text-zinc-500">
					Create tasks with start and due dates to see them on the timeline.
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-zinc-900 bg-zinc-950/45 overflow-hidden flex flex-col h-[calc(100vh-220px)] animate-fade-in">
			<div className="flex-1 overflow-auto relative custom-scrollbar">
				<div
					className="min-w-max pb-10"
					style={{
						display: "grid",
						gridTemplateColumns: `280px repeat(${columns}, 80px)`,
					}}
				>
					{/* Header Row: Months */}
					<div className="sticky top-0 left-0 z-20 bg-zinc-950/90 backdrop-blur-sm border-b border-r border-zinc-900 p-3 flex items-end">
						<span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
							Tasks
						</span>
					</div>
					{months.map((m, i) => (
						<div
							key={`${m.monthYear}-${i}`}
							className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-900 p-2 border-r"
							style={{ gridColumn: `span ${m.colSpan}` }}
						>
							<span className="text-xs font-semibold text-zinc-300">
								{m.monthYear}
							</span>
						</div>
					))}

					{/* Sub-Header Row: Days */}
					<div className="sticky top-[45px] left-0 z-20 bg-zinc-950/90 backdrop-blur-sm border-b border-r border-zinc-900" />
					{days.map((day) => {
						const isWeekend = day.getDay() === 0 || day.getDay() === 6;
						return (
							<div
								key={`day-${day.toISOString()}`}
								className={cn(
									"sticky top-[45px] z-10 border-b border-zinc-900 p-2 text-center border-r flex flex-col items-center justify-center gap-1",
									isWeekend ? "bg-zinc-900/20" : "bg-zinc-950/90",
									isToday(day) && "bg-violet-500/10",
								)}
							>
								<span
									className={cn(
										"text-[10px] uppercase font-semibold",
										isToday(day) ? "text-violet-400" : "text-zinc-500",
									)}
								>
									{format(day, "Eee")}
								</span>
								<span
									className={cn(
										"text-xs font-medium flex h-6 w-6 items-center justify-center rounded-full",
										isToday(day) ? "bg-violet-500 text-white" : "text-zinc-300",
									)}
								>
									{format(day, "d")}
								</span>
							</div>
						);
					})}

					{/* Grid Lines and Task Rows */}
					{tasks.map((task, rowIndex) => {
						const taskStart = startOfDay(
							new Date(task.startDate || task.createdAt),
						);
						const taskEnd = startOfDay(
							new Date(task.dueDate || task.startDate || task.createdAt),
						);

						// +2 because grid column starts at 1, and the first column is the task list (so +1 +1)
						const startCol = differenceInDays(taskStart, minDate) + 2;
						const endCol = differenceInDays(taskEnd, minDate) + 3; // +3 to span to the end of the day

						return (
							<React.Fragment key={task.id}>
								{/* Task List Column (Sticky) */}
								<div className="sticky left-0 z-10 border-b border-r border-zinc-900 bg-zinc-950/90 p-3 hover:bg-zinc-900/50 transition-colors group">
									<button
										type="button"
										onClick={() => onTaskClick(task.id)}
										className="flex flex-col items-start w-full text-left"
									>
										<span className="text-sm font-medium text-zinc-200 line-clamp-1 group-hover:text-violet-300 transition-colors">
											{task.title}
										</span>
										<span className="text-[10px] text-zinc-500 mt-1">
											{format(taskStart, "MMM d")} - {format(taskEnd, "MMM d")}
										</span>
									</button>
								</div>

								{/* Timeline Grid Cells */}
								{days.map((day, dayIndex) => {
									const isWeekend = day.getDay() === 0 || day.getDay() === 6;
									return (
										<div
											key={`cell-${task.id}-${dayIndex}`}
											className={cn(
												"border-b border-r border-zinc-900/30",
												isWeekend ? "bg-zinc-900/20" : "",
												isToday(day) && "bg-violet-500/5",
											)}
										/>
									);
								})}

								{/* Task Bar */}
								<div
									className="relative flex items-center pr-2 group z-5"
									style={{
										gridColumnStart: Math.max(2, startCol),
										gridColumnEnd: Math.min(columns + 2, endCol),
										gridRow: rowIndex + 3, // +3 because of the 2 header rows and CSS grid is 1-indexed
									}}
								>
									<button
										type="button"
										onClick={() => onTaskClick(task.id)}
										className={cn(
											"h-8 w-full rounded-md shadow-sm opacity-90 hover:opacity-100 transition-all hover:shadow-md flex items-center px-2 min-w-[20px] overflow-hidden ml-1 border",
											task.status === "done"
												? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
												: task.status === "in_progress"
													? "bg-blue-500/20 text-blue-300 border-blue-500/30"
													: task.status === "todo"
														? "bg-zinc-700/50 text-zinc-300 border-zinc-600"
														: "bg-amber-500/20 text-amber-300 border-amber-500/30",
										)}
									>
										<span className="truncate text-xs font-semibold">
											{task.title}
										</span>
									</button>
								</div>
							</React.Fragment>
						);
					})}
				</div>
			</div>
		</div>
	);
}
