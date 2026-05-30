"use client";

import { Loader2 } from "lucide-react";
import type React from "react";
import { Button } from "../button/Button";
import { Dialog } from "./Dialog";

interface ConfirmDialogProps {
	/** Controls dialog visibility */
	open: boolean;
	/** Dialog heading */
	title: string;
	/** Optional explanatory text shown below the title */
	description?: string;
	/** Label for the confirm action button (default: "Confirm") */
	confirmLabel?: string;
	/** Label for the cancel button (default: "Cancel") */
	cancelLabel?: string;
	/**
	 * When true the confirm button uses the `danger` variant (red).
	 * Use for destructive actions like deleting or removing. (default: false)
	 */
	isDanger?: boolean;
	/** Whether the confirm action is currently in progress */
	isLoading?: boolean;
	/** Icon rendered inside the confirm button (left of the label) */
	confirmIcon?: React.ReactNode;
	/** Called when the user clicks the confirm button */
	onConfirm: () => void;
	/** Called when the user clicks Cancel or the X close button */
	onClose: () => void;
}

export function ConfirmDialog({
	open,
	title,
	description,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	isDanger = false,
	isLoading = false,
	confirmIcon,
	onConfirm,
	onClose,
}: ConfirmDialogProps) {
	return (
		<Dialog
			open={open}
			title={title}
			description={description}
			onClose={onClose}
		>
			<div className="flex justify-end gap-2 px-5 py-4">
				<Button variant="secondary" onClick={onClose} disabled={isLoading}>
					{cancelLabel}
				</Button>
				<Button
					variant={isDanger ? "danger" : "primary"}
					onClick={onConfirm}
					disabled={isLoading}
				>
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						confirmIcon
					)}
					{confirmLabel}
				</Button>
			</div>
		</Dialog>
	);
}
