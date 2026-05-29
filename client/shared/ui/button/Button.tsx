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
		"border-transparent bg-primary text-primary-foreground shadow-[0_8px_28px_rgba(124,58,237,0.22)] hover:bg-violet-500",
	secondary:
		"border-zinc-800 bg-zinc-900/70 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/70",
	ghost:
		"border-transparent bg-transparent text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-100",
	danger:
		"border-red-500/20 bg-red-500/10 text-red-300 hover:border-red-500/35 hover:bg-red-500/15",
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: "h-8 px-3 text-xs",
	md: "h-9 px-4 text-sm",
	icon: "h-8 w-8 p-0",
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
