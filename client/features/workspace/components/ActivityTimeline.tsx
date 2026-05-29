"use client";

import { Badge } from "@/shared/ui/badge/Badge";
import { TimelineEvent } from "@/shared/ui/timeline/TimelineEvent";
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
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days}d`;
	if (hours > 0) return `${hours}h`;
	if (minutes > 0) return `${minutes}m`;
	return "now";
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
			return `${actor} created ${taskTitle || "a task"}`;
		case "task.updated":
			return `${actor} updated ${taskTitle || "a task"}`;
		case "task.deleted":
			return `${actor} deleted ${taskTitle || "a task"}`;
		case "comment.created":
			return `${actor} commented on ${taskTitle || "a task"}`;
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
			const fields = Object.keys(changes);
			if (fields.length > 0) return `Changed ${fields.join(", ")}`;
		}
	}

	const commentPreview = asText(event.metadata?.commentPreview);
	if (commentPreview) return commentPreview;

	return event.type;
}

interface ActivityTimelineProps {
	workspaceId: string | null;
	workspaceName?: string;
	compact?: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
	workspaceId,
	workspaceName,
	compact = false,
}) => {
	const { data: activities = [], isLoading } = useActivities(workspaceId);

	return (
		<section className="animate-fade-in">
			<div className="mb-4 flex items-start justify-between gap-4">
				<div>
					<p className="ot-label">Live event stream</p>
					<h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-100">
						{workspaceName || "Workspace"} activity
					</h2>
					<p className="mt-1 text-sm leading-6 text-zinc-500">
						Every mutation becomes shared context for the team.
					</p>
				</div>
				<Badge tone="accent">
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
				<div className={compact ? "space-y-3" : "space-y-4"}>
					{activities.slice(0, compact ? 8 : undefined).map((event) => (
						<TimelineEvent
							key={event.id}
							icon={activityIcon[event.type] || CircleDot}
							title={titleForEvent(event)}
							detail={detailForEvent(event)}
							time={relativeTime(event.createdAt)}
							actorName={event.actor?.name}
							actorEmail={event.actor?.email}
							tone={activityTone[event.type] || "neutral"}
						/>
					))}
				</div>
			)}
		</section>
	);
};
