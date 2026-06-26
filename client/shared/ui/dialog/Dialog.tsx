"use client";

import { X } from "lucide-react";
import type React from "react";
import { createPortal } from "react-dom";
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
	if (typeof document === "undefined" || !document.body) return null;

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 sm:items-center sm:p-4">
			<div
				className={cn(
					"max-h-[calc(100dvh-1.5rem)] w-full overflow-hidden rounded-2xl border border-surface-800 bg-surface-950 shadow-(--ot-shadow-panel) animate-scale-in sm:max-h-[calc(100dvh-2rem)]",
					className || "max-w-md",
				)}
			>
				<div className="flex items-start justify-between gap-4 border-b border-surface-900 px-4 py-4 sm:px-5">
					<div className="min-w-0">
						<h2 className="text-sm font-semibold text-surface-100">{title}</h2>
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
				{children}
			</div>
		</div>,
		document.body,
	);
}
