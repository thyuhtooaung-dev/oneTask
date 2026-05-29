"use client";

import { Avatar } from "@/shared/ui/avatar/Avatar";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { Dialog } from "@/shared/ui/dialog/Dialog";
import { Drawer } from "@/shared/ui/drawer/Drawer";
import { Loader2, MessageSquare, Save, Send, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useComments, useCreateComment } from "../hooks/useCommentData";
import {
	type Task,
	type TaskStatus,
	useCreateTask,
	useDeleteTask,
	useUpdateTask,
} from "../hooks/useTaskData";
import { useWorkspaceDetail } from "../hooks/useWorkspaceData";

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
	const { data: comments = [], isLoading: isLoadingComments } = useComments(
		mode === "edit" ? task?.id : null,
	);
	const createTask = useCreateTask(workspaceId);
	const updateTask = useUpdateTask(workspaceId);
	const deleteTask = useDeleteTask(workspaceId);
	const createComment = useCreateComment(task?.id, workspaceId);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState<TaskStatus>("todo");
	const [assigneeId, setAssigneeId] = useState("");
	const [commentContent, setCommentContent] = useState("");

	useEffect(() => {
		if (!isOpen) return;
		setTitle(task?.title || "");
		setDescription(task?.description || "");
		setStatus(task?.status || "todo");
		setAssigneeId(task?.assigneeId || "");
		setCommentContent("");
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

	const handleCreateComment = async () => {
		const content = commentContent.trim();
		if (!content || !task) return;

		await createComment.mutateAsync({ content });
		setCommentContent("");
	};

	const form = (
		<form
			onSubmit={handleSubmit}
			className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]"
		>
			<div className="space-y-4">
				<div className="space-y-2">
					<label htmlFor={`${mode}-task-title`} className="ot-label">
						Title
					</label>
					<input
						id={`${mode}-task-title`}
						required
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						className="ot-input h-11 px-3 text-sm font-medium"
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
						className="ot-input h-36 resize-none px-3 py-2.5 text-sm leading-6"
						placeholder="Add context, constraints, acceptance notes, or links."
					/>
				</div>

				{mode === "edit" && task && (
					<section className="space-y-3 border-t border-zinc-900 pt-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="ot-label">Conversation</p>
								<h3 className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-100">
									<MessageSquare className="h-4 w-4 text-violet-300" />
									Task comments
								</h3>
							</div>
							<Badge>{comments.length}</Badge>
						</div>

						<div className="max-h-72 space-y-4 overflow-y-auto rounded-xl border border-zinc-900 bg-zinc-950/55 p-3">
							{isLoadingComments ? (
								<div className="flex items-center gap-2 py-5 text-xs font-medium text-zinc-500">
									<Loader2 className="h-4 w-4 animate-spin" />
									Loading comments
								</div>
							) : comments.length === 0 ? (
								<p className="py-6 text-center text-xs font-medium text-zinc-600">
									No comments yet. Start the thread without leaving context.
								</p>
							) : (
								comments.map((comment) => {
									const author =
										comment.author?.name || comment.author?.email || "Unknown";

									return (
										<div key={comment.id} className="flex gap-3">
											<Avatar
												name={comment.author?.name}
												email={comment.author?.email}
												size="md"
											/>
											<div className="min-w-0 flex-1">
												<div className="flex flex-wrap items-center gap-2">
													<span className="text-xs font-semibold text-zinc-200">
														{author}
													</span>
													<span className="text-[10px] font-medium text-zinc-600">
														{new Date(comment.createdAt).toLocaleString()}
													</span>
												</div>
												<p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
													{comment.content}
												</p>
											</div>
										</div>
									);
								})
							)}
						</div>

						<div className="space-y-2">
							<textarea
								value={commentContent}
								onChange={(event) => setCommentContent(event.target.value)}
								className="ot-input h-20 resize-none px-3 py-2 text-sm"
								placeholder="Write a comment"
							/>
							<div className="flex justify-end">
								<Button
									type="button"
									onClick={handleCreateComment}
									disabled={createComment.isPending || !commentContent.trim()}
								>
									{createComment.isPending ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Send className="h-4 w-4" />
									)}
									Comment
								</Button>
							</div>
						</div>
					</section>
				)}
			</div>

			<aside className="space-y-4 rounded-2xl border border-zinc-900 bg-zinc-950/45 p-4">
				<div className="space-y-2">
					<label htmlFor={`${mode}-task-status`} className="ot-label">
						Status
					</label>
					<select
						id={`${mode}-task-status`}
						value={status}
						onChange={(event) => setStatus(event.target.value as TaskStatus)}
						className="ot-input h-10 px-3 text-sm"
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
						className="ot-input h-10 px-3 text-sm"
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

				<div className="flex items-center justify-between gap-3 border-t border-zinc-900 pt-4">
					{mode === "edit" ? (
						<Button
							type="button"
							variant="danger"
							onClick={handleDelete}
							disabled={isPending}
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
				className="max-h-[92vh] max-w-[min(1280px,calc(100vw-32px))] overflow-y-auto"
			>
				{form}
			</Dialog>
		);
	}

	return (
		<Drawer
			open={isOpen}
			title={task?.title || "Task"}
			description="Edit details and continue the conversation without losing workspace context."
			onClose={onClose}
		>
			{form}
		</Drawer>
	);
};
