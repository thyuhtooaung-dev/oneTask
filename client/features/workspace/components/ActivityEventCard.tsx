import { AvatarWithRing } from "@/shared/ui/avatar/AvatarWithRing";
import { Badge } from "@/shared/ui/badge/Badge";
import { cn } from "@/shared/ui/cn";
import { ArrowRight } from "lucide-react";
import type React from "react";

interface ActivityEventCardProps {
	actorName?: string | null;
	actorEmail?: string | null;
	title: string;
	detail?: string;
	time: string;
	icon: React.ElementType;
	iconTone?: "neutral" | "accent" | "success" | "danger";
	onClick?: () => void;
	tasks?: {
		todo: number;
		inProgress: number;
		done: number;
	};
	statusTransition?: {
		from?: string;
		to?: string;
	};
}

const toneClasses = {
	neutral: "text-zinc-500 bg-zinc-900 border-zinc-800",
	accent: "text-violet-300 bg-violet-950/50 border-violet-900/50",
	success: "text-emerald-300 bg-emerald-950/50 border-emerald-900/50",
	danger: "text-red-300 bg-red-950/50 border-red-900/50",
};

function getStatusTone(
	status: string,
): "neutral" | "accent" | "success" | "danger" {
	switch (status.toLowerCase()) {
		case "done":
			return "success";
		case "in_progress":
			return "accent";
		case "canceled":
			return "danger";
		default:
			return "neutral";
	}
}

export function ActivityEventCard({
	actorName,
	actorEmail,
	title,
	detail,
	time,
	icon: Icon,
	iconTone = "neutral",
	onClick,
	tasks,
	statusTransition,
}: ActivityEventCardProps) {
	const isClickable = !!onClick;

	return (
		<div className="group relative flex items-start gap-3 sm:gap-4">
			{/* Timeline line connector */}
			<div className="absolute bottom-[-24px] left-[23px] top-[46px] w-px bg-zinc-900 group-last:hidden" />

			<div className="relative shrink-0">
				<AvatarWithRing
					name={actorName}
					email={actorEmail}
					size="md"
					tasks={tasks}
					className="z-10 bg-zinc-950"
				/>
				<div
					className={cn(
						"absolute -bottom-0.5 -right-0.5 z-20 flex h-4 w-4 items-center justify-center rounded-full border ring-2 ring-zinc-950 sm:h-5 sm:w-5",
						toneClasses[iconTone],
					)}
					title="Event type"
				>
					<Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
				</div>
			</div>

			<div
				className={cn(
					"min-w-0 flex-1 rounded-xl border border-zinc-900/90 bg-zinc-950/55 p-3 transition-all duration-200",
					isClickable &&
						"cursor-pointer hover:-translate-y-0.5 hover:border-zinc-800 hover:bg-zinc-900/70 hover:shadow-(--ot-shadow-soft)",
				)}
				onClick={onClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onClick?.();
					}
				}}
				tabIndex={isClickable ? 0 : undefined}
				role={isClickable ? "button" : undefined}
			>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
					<div className="min-w-0 flex-1">
						<p className="line-clamp-2 wrap-break-word text-sm font-medium text-zinc-100">
							{title}
						</p>
						{detail && (
							<p className="mt-1 line-clamp-3 wrap-break-word text-xs leading-5 text-zinc-500 sm:line-clamp-2">
								{detail}
							</p>
						)}
					</div>

					<div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
						<span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">
							{time}
						</span>

						{statusTransition && (
							<div className="flex items-center gap-1.5 mt-1 sm:mt-0">
								{statusTransition.from && (
									<Badge
										tone={getStatusTone(statusTransition.from)}
										className="text-[10px] px-1.5 py-0"
									>
										{statusTransition.from.replace("_", " ")}
									</Badge>
								)}
								{statusTransition.from && statusTransition.to && (
									<ArrowRight className="h-3 w-3 text-zinc-600" />
								)}
								{statusTransition.to && (
									<Badge
										tone={getStatusTone(statusTransition.to)}
										className="text-[10px] px-1.5 py-0"
									>
										{statusTransition.to.replace("_", " ")}
									</Badge>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
