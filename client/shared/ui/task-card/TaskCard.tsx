import {
	AlertOctagon,
	Calendar,
	Minus,
	SignalHigh,
	SignalLow,
	SignalMedium,
} from "lucide-react";
import { Avatar } from "../avatar/Avatar";
import { cn } from "../cn";

interface TaskCardProps {
	title: string;
	description?: string | null;
	assigneeName?: string | null;
	assigneeEmail?: string | null;
	priority?: "none" | "low" | "medium" | "high" | "urgent";
	dueDate?: string | null;
	createdAt?: string;
	onClick?: () => void;
	draggable?: boolean;
	onDragStart?: React.DragEventHandler<HTMLButtonElement>;
	onDragEnd?: React.DragEventHandler<HTMLButtonElement>;
	isDragging?: boolean;
	accentClassName?: string;
}

function formatDate(value?: string) {
	if (!value) return "";
	return new Date(value).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
}

const PRIORITY_ICONS = {
	none: { icon: Minus, color: "text-zinc-500" },
	low: { icon: SignalLow, color: "text-zinc-400" },
	medium: { icon: SignalMedium, color: "text-yellow-400" },
	high: { icon: SignalHigh, color: "text-orange-400" },
	urgent: { icon: AlertOctagon, color: "text-red-500" },
};

export function TaskCard({
	title,
	description,
	assigneeName,
	assigneeEmail,
	priority,
	dueDate,
	createdAt,
	onClick,
	draggable,
	onDragStart,
	onDragEnd,
	isDragging,
	accentClassName = "bg-violet-400",
}: TaskCardProps) {
	return (
		<button
			type="button"
			draggable={draggable}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			onClick={onClick}
			className={cn(
				"group relative min-h-28 w-full overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-3 text-left shadow-(--ot-shadow-soft) transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
				draggable && "cursor-grab active:cursor-grabbing",
				isDragging && "scale-[0.98] border-violet-500/40 opacity-45",
			)}
		>
			<div
				className={cn(
					"absolute left-0 top-0 h-px w-full opacity-80 transition-opacity group-hover:opacity-100",
					accentClassName,
				)}
			/>
			<h4 className="line-clamp-2 text-sm font-semibold leading-5 text-zinc-100 transition-colors group-hover:text-violet-300">
				{title}
			</h4>
			<p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
				{description || "No description"}
			</p>
			<div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-zinc-900 pt-3">
				<div className="flex min-w-0 items-center gap-2">
					<Avatar name={assigneeName} email={assigneeEmail} size="sm" />
					<span className="truncate text-[11px] font-medium text-zinc-500">
						{assigneeName || assigneeEmail || "Unassigned"}
					</span>
				</div>
				<div className="flex items-center gap-2">
					{priority &&
						priority !== "none" &&
						(() => {
							const PriorityIcon = PRIORITY_ICONS[priority].icon;
							return (
								<PriorityIcon
									className={`h-3 w-3 ${PRIORITY_ICONS[priority].color}`}
								/>
							);
						})()}
					{(dueDate || createdAt) &&
						(() => {
							const isOverdue =
								dueDate &&
								new Date(dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
							return (
								<span
									className={cn(
										"inline-flex items-center gap-1 text-[10px] font-medium",
										isOverdue ? "text-red-400" : "text-zinc-600",
									)}
								>
									<Calendar className="h-3 w-3" />
									{formatDate(dueDate || createdAt)}
								</span>
							);
						})()}
				</div>
			</div>
		</button>
	);
}
