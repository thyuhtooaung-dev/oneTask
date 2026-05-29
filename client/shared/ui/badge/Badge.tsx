import type React from "react";
import { cn } from "../cn";

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
	neutral: "border-zinc-800 bg-zinc-900/60 text-zinc-400",
	accent: "border-violet-500/20 bg-violet-500/10 text-violet-300",
	success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
	warning: "border-amber-500/20 bg-amber-500/10 text-amber-300",
	danger: "border-red-500/20 bg-red-500/10 text-red-300",
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]",
				toneClasses[tone],
				className,
			)}
			{...props}
		/>
	);
}
