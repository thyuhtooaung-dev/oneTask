import { X } from "lucide-react";
import type React from "react";
import { Button } from "../button/Button";
import { cn } from "../cn";

interface DrawerProps {
	open: boolean;
	title: string;
	description?: string;
	children: React.ReactNode;
	onClose: () => void;
	className?: string;
}

export function Drawer({
	open,
	title,
	description,
	children,
	onClose,
	className,
}: DrawerProps) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 bg-black/50">
			<div
				className={cn(
					"ml-auto flex h-full w-full flex-col border-surface-800 bg-surface-950 shadow-[var(--ot-shadow-panel)] animate-slide-in md:max-w-[min(760px,calc(100vw-4rem))] md:border-l xl:max-w-5xl",
					className,
				)}
			>
				<div className="flex items-start justify-between gap-4 border-b border-surface-900 px-4 py-4 sm:px-6">
					<div className="min-w-0">
						<h2 className="truncate text-sm font-semibold text-surface-100">
							{title}
						</h2>
						{description && (
							<p className="mt-1 text-xs leading-5 text-surface-500">
								{description}
							</p>
						)}
					</div>
					<Button variant="ghost" size="icon" onClick={onClose} title="Close">
						<X className="h-4 w-4" />
					</Button>
				</div>
				<div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
			</div>
		</div>
	);
}
