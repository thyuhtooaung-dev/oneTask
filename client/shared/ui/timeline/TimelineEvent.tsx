import type React from "react";
import { Avatar } from "../avatar/Avatar";
import { cn } from "../cn";

interface TimelineEventProps {
	icon: React.ElementType;
	title: string;
	detail: string;
	time: string;
	actorName?: string | null;
	actorEmail?: string | null;
	tone?: "neutral" | "accent" | "success" | "danger";
}

const toneClasses = {
	neutral: "text-zinc-500",
	accent: "text-violet-300",
	success: "text-emerald-300",
	danger: "text-red-300",
};

export function TimelineEvent({
	icon: Icon,
	title,
	detail,
	time,
	actorName,
	actorEmail,
	tone = "accent",
}: TimelineEventProps) {
	return (
		<div className="group relative grid grid-cols-[32px_1fr] gap-3">
			<div className="relative flex justify-center">
				<div className="absolute bottom-[-16px] top-8 w-px bg-zinc-900 group-last:hidden" />
				<div
					className={cn(
						"z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950",
						toneClasses[tone],
					)}
				>
					<Icon className="h-4 w-4" />
				</div>
			</div>
			<div className="rounded-xl border border-zinc-900/90 bg-zinc-950/55 p-3 transition-colors duration-150 group-hover:border-zinc-800 group-hover:bg-zinc-900/40">
				<div className="flex items-start justify-between gap-3">
					<div className="flex min-w-0 items-start gap-3">
						<Avatar name={actorName} email={actorEmail} size="sm" />
						<div className="min-w-0">
							<p className="truncate text-sm font-medium text-zinc-100">
								{title}
							</p>
							<p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
								{detail}
							</p>
						</div>
					</div>
					<span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">
						{time}
					</span>
				</div>
			</div>
		</div>
	);
}
