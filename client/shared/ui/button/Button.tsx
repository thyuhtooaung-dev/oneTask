import type React from "react";
import { cn } from "../cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
	primary:
		"border-transparent bg-primary text-primary-foreground shadow-[0_8px_28px_color-mix(in srgb, var(--color-primary-600) 22%, transparent)] hover:bg-primary-500",
	secondary:
		"border-surface-800 bg-surface-900/70 text-surface-200 hover:border-surface-700 hover:bg-surface-800/70",
	ghost:
		"border-transparent bg-transparent text-surface-400 hover:bg-surface-900/70 hover:text-surface-100",
	danger:
		"border-danger-500/20 bg-danger-500/10 text-danger-300 hover:border-danger-500/35 hover:bg-danger-500/15",
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: "min-h-9 px-3 text-xs",
	md: "min-h-10 px-4 py-2 text-sm",
	icon: "h-10 w-10 p-0",
};

export function Button({
	className,
	variant = "secondary",
	size = "md",
	...props
}: ButtonProps) {
	return (
		<button
			type="button"
			className={cn(
				"inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border font-semibold outline-none transition-all duration-150 ease-out focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-50",
				variantClasses[variant],
				sizeClasses[size],
				className,
			)}
			{...props}
		/>
	);
}
