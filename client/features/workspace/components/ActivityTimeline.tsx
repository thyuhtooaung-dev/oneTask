"use client";

import { Badge } from "@/shared/ui/badge/Badge";
import {
	CheckCircle2,
	CircleDot,
	FolderPlus,
	Loader2,
	MessageSquare,
	Pencil,
	Plus,
	Trash2,
	UserCog,
	UserMinus,
	UserPlus,
	Users,
} from "lucide-react";
import type React from "react";
import {
	type ActivityEvent,
	type ActivityEventType,
	useActivities,
} from "../hooks/useActivityData";
import type { Task } from "../hooks/useTaskData";
import { ActivityEventCard } from "./ActivityEventCard";

const activityIcon: Record<ActivityEventType, React.ElementType> = {
	"task.created": Plus,
	"task.updated": Pencil,
	"task.deleted": Trash2,
	"comment.created": MessageSquare,
	"member.joined": UserPlus,
	"member.left": UserMinus,
	"member.updated": UserCog,
	"workspace.created": Users,
	"project.created": FolderPlus,
};

const activityTone: Record<
	ActivityEventType,
	"neutral" | "accent" | "success" | "danger"
> = {
	"task.created": "accent",
	"task.updated": "neutral",
	"task.deleted": "danger",
	"comment.created": "accent",
	"member.joined": "success",
	"member.left": "danger",
	"member.updated": "neutral",
	"workspace.created": "success",
	"project.created": "accent",
};

function relativeTime(value: string) {
	const diff = Date.now() - new Date(value).getTime();
	const seconds = Math.max(1, Math.floor(diff / 1000));
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	if (hours > 0 && hours < 24) return `${hours}h`;
	if (minutes > 0 && hours === 0) return `${minutes}m`;
	if (seconds > 0 && minutes === 0) return "now";

	return new Date(value).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function categorizeDate(dateString: string) {
	const date = new Date(dateString);
	const now = new Date();

	const isToday =
		date.getDate() === now.getDate() &&
		date.getMonth() === now.getMonth() &&
		date.getFullYear() === now.getFullYear();

	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	const isYesterday =
		date.getDate() === yesterday.getDate() &&
		date.getMonth() === yesterday.getMonth() &&
		date.getFullYear() === yesterday.getFullYear();

	const diffTime = Math.abs(now.getTime() - date.getTime());
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	if (isToday) return "Today";
	if (isYesterday) return "Yesterday";
	if (diffDays <= 7) return "Earlier This Week";
	return "Older";
}

function asText(value: unknown) {
	return typeof value === "string" && value.trim() ? value : undefined;
}

function titleForEvent(event: ActivityEvent) {
	const actor = event.actor?.name || event.actor?.email || "Someone";
	const taskTitle = asText(event.metadata?.taskTitle);
	const projectName = asText(event.metadata?.projectName);
	const workspaceName = asText(event.metadata?.workspaceName);

	switch (event.type) {
		case "task.created":
			return `${actor} created ${taskTitle ? `"${taskTitle}"` : "a task"}`;
		case "task.updated":
			return `${actor} updated ${taskTitle ? `"${taskTitle}"` : "a task"}`;
		case "task.deleted":
			return `${actor} deleted ${taskTitle ? `"${taskTitle}"` : "a task"}`;
		case "comment.created":
			return `${actor} commented on ${taskTitle ? `"${taskTitle}"` : "a task"}`;
		case "member.joined":
			return `${actor} joined the workspace`;
		case "member.left":
			return `${actor} removed a member`;
		case "member.updated":
			return `${actor} updated a member's role`;
		case "workspace.created":
			return `${actor} created ${workspaceName || "this workspace"}`;
		case "project.created":
			return `${actor} created ${projectName || "a project"}`;
		default:
			return `${actor} logged an activity`;
	}
}

function detailForEvent(event: ActivityEvent) {
	if (event.type === "task.updated") {
		const changes = event.metadata?.changes;
		if (changes && typeof changes === "object") {
			const fields = Object.keys(changes as object).filter(
				(k) => k !== "status",
			);
			if (fields.length > 0) return `Changed ${fields.join(", ")}`;
		}
	}

	const commentPreview = asText(event.metadata?.commentPreview);
	if (commentPreview) return commentPreview;

	// Omit detail if there's no additional info
	return undefined;
}

export function getActivityIcon(event: ActivityEvent) {
	return {
		icon: activityIcon[event.type] || CircleDot,
		tone: activityTone[event.type] || "neutral",
		title: titleForEvent(event),
		detail: detailForEvent(event),
	};
}

function getActorTasks(actorId?: string, tasks: Task[] = []) {
	if (!actorId) return undefined;
	const actorTasks = tasks.filter((t) => t.assigneeId === actorId);
	return {
		todo: actorTasks.filter((t) => t.status === "todo").length,
		inProgress: actorTasks.filter((t) => t.status === "in_progress").length,
		done: actorTasks.filter((t) => t.status === "done").length,
	};
}

interface ActivityTimelineProps {
	workspaceId: string | null;
	workspaceName?: string;
	compact?: boolean;
	tasks?: Task[];
	onTaskClick?: (taskId: string) => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
	workspaceId,
	workspaceName,
	compact = false,
	tasks = [],
	onTaskClick,
}) => {
	const { data: activities = [], isLoading } = useActivities(workspaceId);

	// Group activities
	const groupedActivities = activities.reduce(
		(acc, event) => {
			const category = categorizeDate(event.createdAt);
			if (!acc[category]) acc[category] = [];
			acc[category].push(event);
			return acc;
		},
		{} as Record<string, ActivityEvent[]>,
	);

	const groupOrder = ["Today", "Yesterday", "Earlier This Week", "Older"];

	// Truncate groups if compact
	let displayGroups = groupedActivities;
	if (compact) {
		const allCompactActivities = activities.slice(0, 8);
		displayGroups = allCompactActivities.reduce(
			(acc, event) => {
				const category = categorizeDate(event.createdAt);
				if (!acc[category]) acc[category] = [];
				acc[category].push(event);
				return acc;
			},
			{} as Record<string, ActivityEvent[]>,
		);
	}

	return (
		<section className="min-w-0 animate-fade-in">
			<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
				<div className="min-w-0">
					<p className="ot-label">Live event stream</p>
					<h2 className="mt-1 wrap-break-word text-xl font-semibold tracking-tight text-zinc-100">
						{workspaceName || "Workspace"} activity
					</h2>
					<p className="mt-1 text-sm leading-6 text-zinc-500">
						Every mutation becomes shared context for the team.
					</p>
				</div>
				<Badge tone="accent" className="shrink-0 self-start">
					<CircleDot className="h-3 w-3" />
					{activities.length} events
				</Badge>
			</div>

			{isLoading ? (
				<div className="flex items-center gap-2 rounded-xl border border-zinc-900 bg-zinc-950/60 px-4 py-8 text-sm font-medium text-zinc-500">
					<Loader2 className="h-4 w-4 animate-spin" />
					Loading activity
				</div>
			) : activities.length === 0 ? (
				<div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 px-6 py-10 text-center">
					<CheckCircle2 className="mx-auto mb-3 h-6 w-6 text-zinc-700" />
					<p className="text-sm font-semibold text-zinc-300">
						No activity recorded yet
					</p>
					<p className="mt-1 text-xs text-zinc-600">
						Create a task, project, comment, or invite to start the stream.
					</p>
				</div>
			) : (
				<div className="space-y-8">
					{groupOrder.map((groupName) => {
						const groupEvents = displayGroups[groupName];
						if (!groupEvents || groupEvents.length === 0) return null;

						return (
							<div key={groupName} className="space-y-4">
								<h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 pl-[34px] sm:pl-[43px]">
									{groupName}
								</h3>
								<div className="space-y-4">
									{groupEvents.map((event) => {
										let statusTransition:
											| { from: string; to: string }
											| undefined;
										if (
											event.type === "task.updated" &&
											event.metadata?.changes
										) {
											const changes = event.metadata.changes as {
												status?: { from: string; to: string };
											};
											if (changes.status) {
												statusTransition = {
													from: changes.status.from,
													to: changes.status.to,
												};
											}
										}

										const isTaskEvent =
											event.type.startsWith("task.") ||
											event.type === "comment.created";
										const handleClick =
											isTaskEvent && event.entityId && onTaskClick
												? () => onTaskClick(event.entityId as string)
												: undefined;

										return (
											<ActivityEventCard
												key={event.id}
												icon={activityIcon[event.type] || CircleDot}
												iconTone={activityTone[event.type]}
												title={titleForEvent(event)}
												detail={detailForEvent(event)}
												time={relativeTime(event.createdAt)}
												actorName={event.actor?.name}
												actorEmail={event.actor?.email}
												tasks={getActorTasks(event.actor?.id, tasks)}
												statusTransition={statusTransition}
												onClick={handleClick}
											/>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</section>
	);
};
