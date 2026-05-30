"use client";

import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { ConfirmDialog } from "@/shared/ui/dialog/ConfirmDialog";
import { Dialog } from "@/shared/ui/dialog/Dialog";
import { Drawer } from "@/shared/ui/drawer/Drawer";
import { Loader2, Save, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
	type Task,
	type TaskStatus,
	useCreateTask,
	useDeleteTask,
	useUpdateTask,
} from "../hooks/useTaskData";
import { useWorkspaceDetail } from "../hooks/useWorkspaceData";
import { TaskComments } from "./TaskComments";

const STATUS_OPTIONS: Array<{
	value: TaskStatus;
	label: string;
	tone: "neutral" | "accent" | "success" | "danger";
}> = [
	{ value: "todo", label: "Todo", tone: "neutral" },
	{ value: "in_progress", label: "In progress", tone: "accent" },
	{ value: "done", label: "Done", tone: "success" },
	{ value: "canceled", label: "Canceled", tone: "danger" },
];

interface TaskModalProps {
	isOpen: boolean;
	mode: "create" | "edit";
	workspaceId: string | null;
	projectId: string | null;
	task?: Task;
	onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
	isOpen,
	mode,
	workspaceId,
	projectId,
	task,
	onClose,
}) => {
	const { data: workspace } = useWorkspaceDetail(workspaceId);
	const createTask = useCreateTask(workspaceId);
	const updateTask = useUpdateTask(workspaceId);
	const deleteTask = useDeleteTask(workspaceId);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState<TaskStatus>("todo");
	const [assigneeId, setAssigneeId] = useState("");
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

	useEffect(() => {
		if (!isOpen) return;
		setTitle(task?.title || "");
		setDescription(task?.description || "");
		setStatus(task?.status || "todo");
		setAssigneeId(task?.assigneeId || "");
		setIsDeleteConfirmOpen(false);
	}, [isOpen, task]);

	const members = useMemo(() => workspace?.members || [], [workspace]);
	const isPending =
		createTask.isPending || updateTask.isPending || deleteTask.isPending;
	const activeStatus = STATUS_OPTIONS.find((option) => option.value === status);

	if (!isOpen) return null;
	if (mode === "edit" && !task) return null;

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!title.trim()) return;

		if (mode === "create") {
			if (!projectId) return;
			await createTask.mutateAsync({
				title: title.trim(),
				description: description.trim() || undefined,
				status,
				projectId,
				assigneeId: assigneeId || null,
			});
		} else if (task) {
			await updateTask.mutateAsync({
				taskId: task.id,
				title: title.trim(),
				description: description.trim() || null,
				status,
				assigneeId: assigneeId || null,
			});
		}

		onClose();
	};

	const handleDelete = async () => {
		if (!task) return;
		await deleteTask.mutateAsync(task.id);
		onClose();
	};

	const form = (
		<form
			onSubmit={handleSubmit}
			className="grid min-h-full gap-4 p-4 sm:gap-6 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px]"
		>
			<div className="min-w-0 space-y-4">
				<div className="space-y-2">
					<label htmlFor={`${mode}-task-title`} className="ot-label">
						Title
					</label>
					<input
						id={`${mode}-task-title`}
						required
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						className="ot-input min-h-11 px-3 text-sm font-medium"
						placeholder="Write a clear task title"
					/>
				</div>

				<div className="space-y-2">
					<label htmlFor={`${mode}-task-description`} className="ot-label">
						Description
					</label>
					<textarea
						id={`${mode}-task-description`}
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						className="ot-input min-h-36 resize-y px-3 py-2.5 text-sm leading-6"
						placeholder="Add context, constraints, acceptance notes, or links."
					/>
				</div>

				{mode === "edit" && task && (
					<TaskComments taskId={task.id} workspaceId={workspaceId} />
				)}
			</div>

			<aside className="space-y-4 rounded-2xl border border-zinc-900 bg-zinc-950/45 p-4 lg:sticky lg:top-0 lg:self-start">
				<div className="space-y-2">
					<label htmlFor={`${mode}-task-status`} className="ot-label">
						Status
					</label>
					<select
						id={`${mode}-task-status`}
						value={status}
						onChange={(event) => setStatus(event.target.value as TaskStatus)}
						className="ot-input min-h-10 px-3 text-sm"
					>
						{STATUS_OPTIONS.map((option) => (
							<option
								key={option.value}
								value={option.value}
								className="bg-zinc-950 text-white"
							>
								{option.label}
							</option>
						))}
					</select>
					{activeStatus && (
						<Badge tone={activeStatus.tone}>{activeStatus.label}</Badge>
					)}
				</div>

				<div className="space-y-2">
					<label htmlFor={`${mode}-task-assignee`} className="ot-label">
						Assignee
					</label>
					<select
						id={`${mode}-task-assignee`}
						value={assigneeId}
						onChange={(event) => setAssigneeId(event.target.value)}
						className="ot-input min-h-10 px-3 text-sm"
					>
						<option value="" className="bg-zinc-950 text-zinc-400">
							Unassigned
						</option>
						{members.map((member) => (
							<option
								key={member.userId}
								value={member.userId}
								className="bg-zinc-950 text-white"
							>
								{member.user?.name || member.user?.email || member.userId}
							</option>
						))}
					</select>
				</div>

				<div className="flex flex-col-reverse gap-3 border-t border-zinc-900 pt-4 sm:flex-row sm:items-center sm:justify-between">
					{mode === "edit" ? (
						<Button
							type="button"
							variant="danger"
							onClick={() => setIsDeleteConfirmOpen(true)}
							disabled={isPending}
							className="w-full sm:w-auto"
						>
							<Trash2 className="h-4 w-4" />
							Delete
						</Button>
					) : (
						<span />
					)}

					<Button
						type="submit"
						variant="primary"
						disabled={
							isPending || !title.trim() || (mode === "create" && !projectId)
						}
						className="w-full sm:w-auto"
					>
						{isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Save className="h-4 w-4" />
						)}
						{mode === "create" ? "Create" : "Save"}
					</Button>
				</div>
			</aside>
		</form>
	);

	if (mode === "create") {
		return (
			<Dialog
				open={isOpen}
				title="Create task"
				description="The task will be created, logged as an event, and reflected across the workspace."
				onClose={onClose}
				className="max-w-[min(1280px,calc(100vw-1.5rem))] overflow-y-auto"
			>
				{form}
			</Dialog>
		);
	}

	return (
		<>
			<Drawer
				open={isOpen}
				title={task?.title || "Task"}
				description="Edit details and continue the conversation without losing workspace context."
				onClose={onClose}
			>
				{form}
			</Drawer>
			<ConfirmDialog
				open={isDeleteConfirmOpen}
				title="Delete task"
				description="This removes the task and its comments from the workspace."
				confirmLabel="Delete"
				isDanger
				isLoading={deleteTask.isPending}
				confirmIcon={<Trash2 className="h-4 w-4" />}
				onConfirm={handleDelete}
				onClose={() => setIsDeleteConfirmOpen(false)}
			/>
		</>
	);
};
