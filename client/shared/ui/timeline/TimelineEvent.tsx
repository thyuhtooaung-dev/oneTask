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
	neutral: "text-surface-500",
	accent: "text-primary-300",
	success: "text-success-300",
	danger: "text-danger-300",
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
		<div className="group relative grid min-w-0 grid-cols-[28px_minmax(0,1fr)] gap-2 sm:grid-cols-[32px_minmax(0,1fr)] sm:gap-3">
			<div className="relative flex justify-center">
				<div className="absolute bottom-[-16px] top-8 w-px bg-surface-900 group-last:hidden" />
				<div
					className={cn(
						"z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-surface-800 bg-surface-950 sm:h-8 sm:w-8",
						toneClasses[tone],
					)}
				>
					<Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
				</div>
			</div>
			<div className="min-w-0 overflow-hidden rounded-xl border border-surface-900/90 bg-surface-950/55 p-3 transition-colors duration-150 group-hover:border-surface-800 group-hover:bg-surface-900/40">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
					<div className="flex min-w-0 items-start gap-3">
						<Avatar name={actorName} email={actorEmail} size="sm" />
						<div className="min-w-0">
							<p className="line-clamp-2 break-words text-sm font-medium text-surface-100 sm:truncate">
								{title}
							</p>
							<p className="mt-1 line-clamp-3 break-words text-xs leading-5 text-surface-500 sm:line-clamp-2">
								{detail}
							</p>
						</div>
					</div>
					<span className="shrink-0 pl-9 text-[10px] font-bold uppercase tracking-[0.14em] text-surface-600 sm:pl-0">
						{time}
					</span>
				</div>
			</div>
		</div>
	);
}
