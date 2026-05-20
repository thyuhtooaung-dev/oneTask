"use client";

import { Loader2, MessageSquare, Save, Send, Trash2, X } from "lucide-react";
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

const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
	{ value: "todo", label: "Todo" },
	{ value: "in_progress", label: "In Progress" },
	{ value: "done", label: "Done" },
	{ value: "canceled", label: "Canceled" },
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

	const handleCreateComment = async (event: React.FormEvent) => {
		event.preventDefault();
		const content = commentContent.trim();
		if (!content || !task) return;

		await createComment.mutateAsync({ content });
		setCommentContent("");
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in">
			<div
				className={`w-full rounded-2xl border border-zinc-800/70 bg-zinc-950/90 shadow-2xl shadow-black/40 backdrop-blur-xl ${
					mode === "edit" ? "max-w-4xl" : "max-w-xl"
				}`}
			>
				<div className="flex items-center justify-between border-b border-zinc-900/80 px-5 py-4">
					<div>
						<h2 className="text-sm font-bold text-white">
							{mode === "create" ? "Create Task" : "Edit Task"}
						</h2>
						<p className="mt-0.5 text-xs font-medium text-zinc-500">
							{mode === "create"
								? "Add a task to the active project."
								: "Update task details and ownership."}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-white"
						title="Close"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className={`gap-5 px-5 py-5 ${
						mode === "edit"
							? "grid grid-cols-1 lg:grid-cols-[1fr_280px]"
							: "space-y-4"
					}`}
				>
					<div className="space-y-4">
						<div>
							<label
								htmlFor={`${mode}-task-title`}
								className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500"
							>
								Title
							</label>
							<input
								id={`${mode}-task-title`}
								type="text"
								required
								value={title}
								onChange={(event) => setTitle(event.target.value)}
								className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2.5 text-sm font-medium text-white outline-none transition-colors focus:border-indigo-500/70"
								placeholder="Write a clear task title"
							/>
						</div>

						<div>
							<label
								htmlFor={`${mode}-task-description`}
								className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500"
							>
								Description
							</label>
							<textarea
								id={`${mode}-task-description`}
								value={description}
								onChange={(event) => setDescription(event.target.value)}
								className="h-28 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-indigo-500/70"
								placeholder="Add context, constraints, or acceptance notes"
							/>
						</div>

						{mode === "edit" && task && (
							<section className="space-y-3 border-t border-zinc-900/80 pt-4">
								<div className="flex items-center justify-between">
									<h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
										<MessageSquare className="h-4 w-4 text-indigo-400" />
										<span>Comments</span>
									</h3>
									<span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-zinc-500">
										{comments.length}
									</span>
								</div>

								<div className="max-h-64 space-y-3 overflow-y-auto rounded-xl border border-zinc-900 bg-zinc-950/45 p-3">
									{isLoadingComments ? (
										<div className="flex items-center gap-2 py-5 text-xs font-medium text-zinc-500">
											<Loader2 className="h-4 w-4 animate-spin" />
											<span>Loading comments...</span>
										</div>
									) : comments.length === 0 ? (
										<p className="py-5 text-center text-xs font-medium text-zinc-600">
											No comments yet
										</p>
									) : (
										comments.map((comment) => {
											const author =
												comment.author?.name ||
												comment.author?.email ||
												"Unknown";
											const initials = author
												.split(" ")
												.map((part) => part[0])
												.join("")
												.slice(0, 2)
												.toUpperCase();

											return (
												<div key={comment.id} className="flex gap-3">
													<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-[10px] font-bold text-indigo-300">
														{initials}
													</div>
													<div className="min-w-0 flex-1">
														<div className="flex flex-wrap items-center gap-2">
															<span className="text-xs font-bold text-zinc-200">
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
										className="h-20 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-indigo-500/70"
										placeholder="Write a comment"
									/>
									<div className="flex justify-end">
										<button
											type="button"
											onClick={handleCreateComment}
											disabled={
												createComment.isPending || !commentContent.trim()
											}
											className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 transition-colors hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
										>
											{createComment.isPending ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Send className="h-4 w-4" />
											)}
											<span>Comment</span>
										</button>
									</div>
								</div>
							</section>
						)}
					</div>

					<div
						className={
							mode === "edit"
								? "space-y-4 lg:border-l lg:border-zinc-900/80 lg:pl-5"
								: "space-y-4"
						}
					>
						<div
							className={
								mode === "edit"
									? "space-y-4"
									: "grid grid-cols-1 gap-4 sm:grid-cols-2"
							}
						>
							<div>
								<label
									htmlFor={`${mode}-task-status`}
									className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500"
								>
									Status
								</label>
								<select
									id={`${mode}-task-status`}
									value={status}
									onChange={(event) =>
										setStatus(event.target.value as TaskStatus)
									}
									className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2.5 text-sm font-medium text-white outline-none transition-colors focus:border-indigo-500/70"
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
							</div>

							<div>
								<label
									htmlFor={`${mode}-task-assignee`}
									className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500"
								>
									Assignee
								</label>
								<select
									id={`${mode}-task-assignee`}
									value={assigneeId}
									onChange={(event) => setAssigneeId(event.target.value)}
									className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2.5 text-sm font-medium text-white outline-none transition-colors focus:border-indigo-500/70"
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
						</div>

						<div className="flex items-center justify-between gap-3 pt-2">
							{mode === "edit" ? (
								<button
									type="button"
									onClick={handleDelete}
									disabled={isPending}
									className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 px-3 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<Trash2 className="h-4 w-4" />
									<span>Delete</span>
								</button>
							) : (
								<span />
							)}

							<button
								type="submit"
								disabled={
									isPending ||
									!title.trim() ||
									(mode === "create" && !projectId)
								}
								className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Save className="h-4 w-4" />
								)}
								<span>{mode === "create" ? "Create" : "Save"}</span>
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};
