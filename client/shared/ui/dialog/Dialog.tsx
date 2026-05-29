import { X } from "lucide-react";
import type React from "react";
import { Button } from "../button/Button";
import { cn } from "../cn";

interface DialogProps {
	open: boolean;
	title: string;
	description?: string;
	children: React.ReactNode;
	onClose: () => void;
	className?: string;
}

export function Dialog({
	open,
	title,
	description,
	children,
	onClose,
	className,
}: DialogProps) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
			<div
				className={cn(
					"w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-(--ot-shadow-panel) animate-scale-in",
					className || "max-w-md",
				)}
			>
				<div className="flex items-start justify-between border-b border-zinc-900 px-5 py-4">
					<div>
						<h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
						{description && (
							<p className="mt-1 text-xs leading-5 text-zinc-500">
								{description}
							</p>
						)}
					</div>
					<Button variant="ghost" size="icon" onClick={onClose} title="Close">
						<X className="h-4 w-4" />
					</Button>
				</div>
				{children}
			</div>
		</div>
	);
}
