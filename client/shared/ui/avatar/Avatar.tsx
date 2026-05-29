import { User } from "lucide-react";
import { cn } from "../cn";

interface AvatarProps {
	name?: string | null;
	email?: string | null;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const sizeClasses = {
	sm: "h-6 w-6 text-[10px]",
	md: "h-8 w-8 text-xs",
	lg: "h-10 w-10 text-sm",
};

export function Avatar({ name, email, size = "md", className }: AvatarProps) {
	const label = name || email || "";
	const initials = label
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<div
			className={cn(
				"inline-flex shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 font-bold text-violet-300",
				sizeClasses[size],
				className,
			)}
			title={label || "Unassigned"}
		>
			{initials || <User className="h-3.5 w-3.5 text-zinc-600" />}
		</div>
	);
}
