import { User } from "lucide-react";
import { cn } from "../cn";

interface AvatarProps {
	name?: string | null;
	email?: string | null;
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
	isOnline?: boolean;
}

const sizeClasses = {
	sm: "h-6 w-6 text-[10px]",
	md: "h-8 w-8 text-xs",
	lg: "h-10 w-10 text-sm",
	xl: "h-12 w-12 text-base",
};

export function Avatar({
	name,
	email,
	size = "md",
	className,
	isOnline,
}: AvatarProps) {
	const label = name || email || "";
	const initials = label
		.split(" ")
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<div className="relative inline-flex shrink-0">
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
			{isOnline && (
				<div
					className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 bg-emerald-500"
					title="Online"
				/>
			)}
		</div>
	);
}
