import type React from "react";
import { cn } from "../cn";

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
	neutral: "border-surface-800 bg-surface-900/60 text-surface-400",
	accent: "border-primary-500/20 bg-primary-500/10 text-primary-300",
	success: "border-success-500/20 bg-success-500/10 text-success-300",
	warning: "border-warning-500/20 bg-warning-500/10 text-warning-300",
	danger: "border-danger-500/20 bg-danger-500/10 text-danger-300",
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
