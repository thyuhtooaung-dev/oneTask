"use client";

import {
	CheckCircle2,
	CircleDot,
	FolderPlus,
	Loader2,
	MessageSquare,
	Pencil,
	Plus,
	Trash2,
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
	"workspace.created": Users,
	"project.created": FolderPlus,
};

function relativeTime(value: string) {
	const diff = Date.now() - new Date(value).getTime();
	const seconds = Math.max(1, Math.floor(diff / 1000));
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days}d ago`;
	if (hours > 0) return `${hours}h ago`;
	if (minutes > 0) return `${minutes}m ago`;
	return "just now";
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
			return `${actor} commented on a task`;
		case "member.joined":
			return `${actor} joined the workspace`;
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
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
	workspaceId,
	workspaceName,
}) => {
	const { data: activities = [], isLoading } = useActivities(workspaceId);

	return (
		<div className="space-y-5 animate-fade-in">
			<div className="flex items-center justify-between border-b border-zinc-900/70 pb-5">
				<div>
					<h2 className="text-xl font-bold text-white">
						{workspaceName || "Workspace"} Feed
					</h2>
					<p className="mt-1 text-xs font-medium text-zinc-500">
						Chronological activity across projects, tasks, and collaboration.
					</p>
				</div>
				<div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-xs font-bold text-zinc-400">
					<CircleDot className="h-4 w-4 text-emerald-400" />
					<span>{activities.length} events</span>
				</div>
			</div>

			{isLoading ? (
				<div className="flex items-center gap-2 py-10 text-sm font-medium text-zinc-500">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span>Loading activity...</span>
				</div>
			) : activities.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/20 px-6 py-10 text-center">
					<CheckCircle2 className="mx-auto mb-3 h-6 w-6 text-zinc-600" />
					<p className="text-sm font-semibold text-zinc-300">
						No activity recorded yet
					</p>
				</div>
			) : (
				<div className="relative pl-8">
					<div className="absolute left-3 top-0 h-full w-px bg-zinc-800/80" />
					<div className="space-y-4">
						{activities.map((event) => {
							const Icon = activityIcon[event.type] || CircleDot;

							return (
								<div key={event.id} className="relative">
									<div className="absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-indigo-400">
										<Icon className="h-3.5 w-3.5" />
									</div>
									<div className="rounded-2xl border border-zinc-900/80 bg-zinc-950/35 px-4 py-3 backdrop-blur-md">
										<div className="flex flex-wrap items-start justify-between gap-2">
											<p className="text-sm font-semibold text-zinc-100">
												{titleForEvent(event)}
											</p>
											<span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
												{relativeTime(event.createdAt)}
											</span>
										</div>
										<p className="mt-1 text-xs font-medium text-zinc-500">
											{detailForEvent(event)}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};
