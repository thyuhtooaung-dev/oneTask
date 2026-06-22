"use client";

import { cn } from "@/shared/ui/cn";
import {
  addDays,
  differenceInDays,
  format,
  isToday,
  startOfDay,
} from "date-fns";
import {
  CalendarIcon,
  User,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import React, { useMemo, useRef, useEffect } from "react";
import type { Task, TaskPriority } from "../hooks/useTaskData";

interface ProjectTimelineProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

const PriorityIcon = ({ priority }: { priority: TaskPriority }) => {
  switch (priority) {
    case "urgent":
      return <AlertCircle className="w-3 h-3 text-red-500" />;
    case "high":
      return <ArrowUp className="w-3 h-3 text-orange-500" />;
    case "medium":
      return <ArrowUp className="w-3 h-3 text-yellow-500" />;
    case "low":
      return <ArrowDown className="w-3 h-3 text-blue-500" />;
    default:
      return null;
  }
};

export function ProjectTimeline({ tasks, onTaskClick }: ProjectTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayColumnRef = useRef<HTMLDivElement>(null);

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

  const scrollToToday = () => {
    if (scrollContainerRef.current && todayColumnRef.current) {
      const container = scrollContainerRef.current;
      const todayElement = todayColumnRef.current;

      // Calculate the center position (280px is the sticky left column width)
      const scrollLeft =
        todayElement.offsetLeft -
        container.clientWidth / 2 +
        todayElement.clientWidth / 2 -
        280;

      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // Small timeout to ensure layout is calculated before scrolling
    const timer = setTimeout(() => {
      scrollToToday();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950/45 overflow-hidden flex flex-col h-[calc(100vh-220px)] animate-fade-in relative">
      {/* Scroll to Today Button */}
      <div className="absolute top-3 right-4 z-40">
        <button
          type="button"
          onClick={scrollToToday}
          className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded-full border border-zinc-700 shadow-sm backdrop-blur-md transition-all hover:shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          Today
        </button>
      </div>

      <div
        className="flex-1 overflow-auto relative custom-scrollbar"
        ref={scrollContainerRef}
      >
        <div
          className="min-w-max pb-10"
          style={{
            display: "grid",
            gridTemplateColumns: `280px repeat(${columns}, 80px)`,
          }}
        >
          {/* Header Row: Months */}
          <div className="sticky top-0 left-0 z-40 bg-zinc-950/90 backdrop-blur-sm border-b border-r border-zinc-900 p-3 flex items-end">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Tasks
            </span>
          </div>
          {months.map((m, i) => (
            <div
              key={`${m.monthYear}-${i}`}
              className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-900 p-2 border-r"
              style={{ gridColumn: `span ${m.colSpan}` }}
            >
              <span className="text-xs font-semibold text-zinc-300">
                {m.monthYear}
              </span>
            </div>
          ))}

          {/* Sub-Header Row: Days */}
          <div className="sticky top-[45px] left-0 z-40 bg-zinc-950/90 backdrop-blur-sm border-b border-r border-zinc-900" />
          {days.map((day) => {
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const isCurrentDay = isToday(day);
            return (
              <div
                key={`day-${day.toISOString()}`}
                ref={isCurrentDay ? todayColumnRef : null}
                className={cn(
                  "sticky top-[45px] z-30 border-b border-zinc-900 p-2 text-center border-r flex flex-col items-center justify-center gap-1",
                  isWeekend ? "bg-zinc-900/20" : "bg-zinc-950/90",
                  isCurrentDay && "bg-violet-500/10",
                )}
              >
                <span
                  className={cn(
                    "text-[10px] uppercase font-semibold",
                    isCurrentDay ? "text-violet-400" : "text-zinc-500",
                  )}
                >
                  {format(day, "Eee")}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium flex h-6 w-6 items-center justify-center rounded-full",
                    isCurrentDay ? "bg-violet-500 text-white" : "text-zinc-300",
                  )}
                >
                  {format(day, "d")}
                </span>
                {/* Vertical Today Line */}
                {isCurrentDay && (
                  <div className="absolute top-full left-1/2 w-[2px] h-[2000px] bg-violet-500/50 shadow-[0_0_8px_rgba(139,92,246,0.8)] -translate-x-1/2 z-10 pointer-events-none" />
                )}
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
                <div className="sticky left-0 z-20 border-b border-r border-zinc-900 bg-zinc-950/90 p-3 hover:bg-zinc-900/50 transition-colors group flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onTaskClick(task.id)}
                    className="flex flex-col items-start text-left overflow-hidden pr-2 flex-1"
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      <PriorityIcon priority={task.priority} />
                      <span className="text-sm font-medium text-zinc-200 truncate group-hover:text-violet-300 transition-colors">
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 ml-4 truncate w-full">
                      {format(taskStart, "MMM d")} - {format(taskEnd, "MMM d")}
                    </span>
                  </button>

                  {/* Assignee Avatar */}
                  <div className="shrink-0">
                    {task.assignee ? (
                      <div
                        className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700"
                        title={task.assignee.name}
                      >
                        {task.assignee.avatarUrl ? (
                          <img
                            src={task.assignee.avatarUrl}
                            alt={task.assignee.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] font-medium text-zinc-300">
                            {task.assignee?.name?.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div
                        className="h-6 w-6 rounded-full bg-zinc-900/50 flex items-center justify-center border border-zinc-800 border-dashed"
                        title="Unassigned"
                      >
                        <User className="h-3 w-3 text-zinc-600" />
                      </div>
                    )}
                  </div>
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
                  className="relative flex items-center pr-2 group z-10"
                  style={{
                    gridColumnStart: Math.max(2, startCol),
                    gridColumnEnd: Math.min(columns + 2, endCol),
                    gridRow: rowIndex + 3, // +3 because of the 2 header rows and CSS grid is 1-indexed
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onTaskClick(task.id)}
                    title={`${task.title} (${format(taskStart, "MMM d")} - ${format(taskEnd, "MMM d")})`}
                    className={cn(
                      "h-8 w-full rounded-md shadow-sm transition-all flex items-center px-2 min-w-[20px] ml-1 border backdrop-blur-md group-hover:scale-[1.01] group-hover:-translate-y-px group-hover:shadow-lg relative overflow-hidden",
                      task.status === "done"
                        ? "bg-linear-to-r from-emerald-500/20 to-emerald-400/5 text-emerald-300 border-emerald-500/30 shadow-emerald-900/10"
                        : task.status === "in_progress"
                          ? "bg-linear-to-r from-blue-500/20 to-blue-400/5 text-blue-300 border-blue-500/30 shadow-blue-900/10"
                          : task.status === "todo"
                            ? "bg-linear-to-r from-zinc-700/50 to-zinc-800/30 text-zinc-300 border-zinc-600 shadow-black/20"
                            : "bg-linear-to-r from-amber-500/20 to-amber-400/5 text-amber-300 border-amber-500/30 shadow-amber-900/10",
                    )}
                  >
                    <span className="truncate text-xs font-semibold z-10">
                      {task.title}
                    </span>
                    {/* Glassmorphic sheen effect */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
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
