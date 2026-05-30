import { cn } from "../cn";
import { Avatar } from "./Avatar";

interface AvatarWithRingProps {
	name?: string | null;
	email?: string | null;
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
	tasks?: {
		todo: number;
		inProgress: number;
		done: number;
	};
}

export function AvatarWithRing({
	name,
	email,
	size = "md",
	className,
	tasks,
}: AvatarWithRingProps) {
	const total = tasks ? tasks.todo + tasks.inProgress + tasks.done : 0;

	// Dimensions
	const sizeMap = {
		sm: 36,
		md: 46,
		lg: 56,
		xl: 70,
	};
	const ringSize = sizeMap[size];
	const strokeWidth = 7;
	const radius = (ringSize - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;

	// Calculate segments
	const segments = [];
	if (total === 0) {
		// Just a gray ring
		segments.push({
			color: "text-zinc-700",
			dasharray: `${circumference} ${circumference}`,
			offset: 0,
		});
	} else {
		let currentOffset = 0;
		const gap = 2; // px gap between segments

		const addSegment = (count: number, color: string) => {
			if (count > 0) {
				const percentage = count / total;
				const length = percentage * circumference - gap;
				const validLength = Math.max(0, length);
				segments.push({
					color,
					dasharray: `${validLength} ${circumference}`,
					offset: -currentOffset,
				});
				currentOffset += percentage * circumference;
			}
		};

		addSegment(tasks?.todo || 0, "text-zinc-500");
		addSegment(tasks?.inProgress || 0, "text-violet-400");
		addSegment(tasks?.done || 0, "text-emerald-400");
	}

	return (
		<div
			className={cn(
				"relative inline-flex items-center justify-center",
				className,
			)}
			style={{ width: ringSize, height: ringSize }}
		>
			{/* SVG Ring */}
			<svg
				width={ringSize}
				height={ringSize}
				className="absolute -rotate-90 animate-[spin_10s_linear_infinite]"
				style={{
					animationDuration: "15s", // Slow subtle spin
				}}
				role="img"
				aria-label="User workload ring"
			>
				{segments.map((segment) => (
					<circle
						key={segment.color}
						cx={ringSize / 2}
						cy={ringSize / 2}
						r={radius}
						fill="transparent"
						className={cn(
							"transition-all duration-1000 ease-out",
							segment.color,
						)}
						stroke="currentColor"
						strokeWidth={strokeWidth}
						strokeDasharray={segment.dasharray}
						strokeDashoffset={segment.offset}
						strokeLinecap="round"
					/>
				))}
			</svg>

			{/* Avatar */}
			<div className="z-10 flex items-center justify-center">
				<Avatar
					name={name}
					email={email}
					size={size}
					className="border-0 bg-zinc-950"
				/>
			</div>
		</div>
	);
}
