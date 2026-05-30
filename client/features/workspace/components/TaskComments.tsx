"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { ConfirmDialog } from "@/shared/ui/dialog/ConfirmDialog";
import {
	Edit3,
	Image as ImageIcon,
	Loader2,
	MessageSquare,
	Plus,
	Save,
	Send,
	Trash2,
	X,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import {
	type CommentAttachment,
	type TaskComment,
	useComments,
	useCreateComment,
	useDeleteComment,
	useUpdateComment,
} from "../hooks/useCommentData";

const MAX_ATTACHMENTS = 4;
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

interface TaskCommentsProps {
	taskId: string;
	workspaceId: string | null;
}

function readImageFile(file: File): Promise<CommentAttachment> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result !== "string") {
				reject(new Error("Could not read image"));
				return;
			}

			resolve({
				name: file.name,
				type: file.type,
				size: file.size,
				dataUrl: reader.result,
			});
		};
		reader.onerror = () => reject(new Error("Could not read image"));
		reader.readAsDataURL(file);
	});
}

function AttachmentGrid({
	attachments,
	onRemove,
}: {
	attachments: CommentAttachment[];
	onRemove?: (index: number) => void;
}) {
	if (attachments.length === 0) return null;

	return (
		<div className="grid gap-2 sm:grid-cols-2">
			{attachments.map((attachment, index) => (
				<div
					key={`${attachment.name}-${attachment.size}-${index}`}
					className="group/image relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950"
				>
					<img
						src={attachment.dataUrl}
						alt={attachment.name}
						className="max-h-64 w-full object-contain"
					/>
					<div className="flex items-center justify-between gap-2 border-t border-zinc-900 px-2 py-1.5">
						<span className="min-w-0 truncate text-[11px] font-medium text-zinc-500">
							{attachment.name}
						</span>
						{onRemove && (
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => onRemove(index)}
								title="Remove image"
								className="h-7 w-7"
							>
								<X className="h-3.5 w-3.5" />
							</Button>
						)}
					</div>
				</div>
			))}
		</div>
	);
}

export const TaskComments: React.FC<TaskCommentsProps> = ({
	taskId,
	workspaceId,
}) => {
	const { user } = useAuth();
	const { data: comments = [], isLoading } = useComments(taskId);
	const createComment = useCreateComment(taskId, workspaceId);
	const updateComment = useUpdateComment(taskId, workspaceId);
	const deleteComment = useDeleteComment(taskId, workspaceId);

	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [commentContent, setCommentContent] = useState("");
	const [attachments, setAttachments] = useState<CommentAttachment[]>([]);
	const [attachmentError, setAttachmentError] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingContent, setEditingContent] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<TaskComment | null>(null);

	const canSend = commentContent.trim().length > 0 || attachments.length > 0;

	const handleCreateComment = async () => {
		if (!canSend || createComment.isPending) return;

		await createComment.mutateAsync({
			content: commentContent.trim(),
			attachments,
		});
		setCommentContent("");
		setAttachments([]);
		setAttachmentError("");
	};

	const handleComposerKeyDown = (
		event: React.KeyboardEvent<HTMLTextAreaElement>,
	) => {
		if (event.nativeEvent.isComposing) return;
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			void handleCreateComment();
		}
	};

	const handleAttachmentSelect = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = Array.from(event.target.files || []);
		event.target.value = "";
		if (files.length === 0) return;

		const imageFiles = files.filter((file) => file.type.startsWith("image/"));
		if (imageFiles.length !== files.length) {
			setAttachmentError("Only image files can be attached.");
			return;
		}

		if (attachments.length + imageFiles.length > MAX_ATTACHMENTS) {
			setAttachmentError(`Attach up to ${MAX_ATTACHMENTS} images per comment.`);
			return;
		}

		if (imageFiles.some((file) => file.size > MAX_ATTACHMENT_BYTES)) {
			setAttachmentError("Each image must be 2MB or smaller.");
			return;
		}

		const nextAttachments = await Promise.all(imageFiles.map(readImageFile));
		setAttachments((current) => [...current, ...nextAttachments]);
		setAttachmentError("");
	};

	const removeAttachment = (index: number) => {
		setAttachments((current) =>
			current.filter((_, itemIndex) => itemIndex !== index),
		);
	};

	const startEditing = (comment: TaskComment) => {
		setEditingId(comment.id);
		setEditingContent(comment.content);
	};

	const cancelEditing = () => {
		setEditingId(null);
		setEditingContent("");
	};

	const handleUpdateComment = async (comment: TaskComment) => {
		const content = editingContent.trim();
		if (!content && !comment.attachments?.length) return;

		await updateComment.mutateAsync({ commentId: comment.id, content });
		cancelEditing();
	};

	const handleDeleteComment = async () => {
		if (!deleteTarget) return;

		await deleteComment.mutateAsync(deleteTarget.id);
		if (editingId === deleteTarget.id) cancelEditing();
		setDeleteTarget(null);
	};

	return (
		<section className="space-y-3 border-t border-zinc-900 pt-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0">
					<p className="ot-label">Conversation</p>
					<h3 className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-100">
						<MessageSquare className="h-4 w-4 shrink-0 text-violet-300" />
						<span className="truncate">Task comments</span>
					</h3>
				</div>
				<Badge className="self-start sm:self-auto">{comments.length}</Badge>
			</div>

			<div className="max-h-[42dvh] space-y-4 overflow-y-auto rounded-xl border border-zinc-900 bg-zinc-950/55 p-3 md:max-h-72">
				{isLoading ? (
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
						const canManage = user?.id === comment.authorId;
						const isEditing = editingId === comment.id;
						const isUpdatingThis =
							updateComment.isPending &&
							updateComment.variables?.commentId === comment.id;
						const commentAttachments = comment.attachments || [];

						return (
							<div key={comment.id} className="group flex min-w-0 gap-3">
								<Avatar
									name={comment.author?.name}
									email={comment.author?.email}
									size="md"
								/>
								<article className="relative min-w-0 flex-1 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/80">
									<header className="border-b border-zinc-900 bg-zinc-900/35 px-3 py-2">
										<div className="flex min-w-0 flex-wrap items-center gap-2">
											<span className="text-xs font-semibold text-zinc-200">
												{author}
											</span>
											<span className="text-[10px] font-medium text-zinc-600">
												{new Date(comment.createdAt).toLocaleString()}
											</span>
											{comment.updatedAt !== comment.createdAt && (
												<span className="text-[10px] font-medium text-zinc-700">
													Edited
												</span>
											)}
										</div>

										{canManage && (
											<div className="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-950/95 opacity-100 shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() =>
														isEditing ? cancelEditing() : startEditing(comment)
													}
													title={isEditing ? "Cancel edit" : "Edit comment"}
													className="h-8 w-8"
												>
													{isEditing ? (
														<X className="h-3.5 w-3.5" />
													) : (
														<Edit3 className="h-3.5 w-3.5" />
													)}
												</Button>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => setDeleteTarget(comment)}
													title="Delete comment"
													className="h-8 w-8 text-red-300 hover:text-red-200"
													disabled={deleteComment.isPending}
												>
													<Trash2 className="h-3.5 w-3.5" />
												</Button>
											</div>
										)}
									</header>

									<div className="space-y-3 px-3 py-3">
										{isEditing ? (
											<div className="space-y-2">
												<textarea
													value={editingContent}
													onChange={(event) =>
														setEditingContent(event.target.value)
													}
													className="ot-input min-h-24 resize-y px-3 py-2 text-sm"
													placeholder="Edit comment"
												/>
												{commentAttachments.length > 0 && (
													<AttachmentGrid attachments={commentAttachments} />
												)}
												<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
													<Button
														type="button"
														variant="ghost"
														onClick={cancelEditing}
														disabled={isUpdatingThis}
														className="w-full sm:w-auto"
													>
														<X className="h-4 w-4" />
														Cancel
													</Button>
													<Button
														type="button"
														variant="primary"
														onClick={() => handleUpdateComment(comment)}
														disabled={
															isUpdatingThis ||
															(!editingContent.trim() &&
																commentAttachments.length === 0)
														}
														className="w-full sm:w-auto"
													>
														{isUpdatingThis ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<Save className="h-4 w-4" />
														)}
														Save
													</Button>
												</div>
											</div>
										) : (
											<>
												{comment.content && (
													<p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-400">
														{comment.content}
													</p>
												)}
												<AttachmentGrid attachments={commentAttachments} />
											</>
										)}
									</div>
								</article>
							</div>
						);
					})
				)}
			</div>

			<div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80 focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/10">
				<textarea
					value={commentContent}
					onChange={(event) => setCommentContent(event.target.value)}
					onKeyDown={handleComposerKeyDown}
					className="min-h-24 w-full resize-y bg-transparent px-3 py-3 text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600"
					placeholder="Write a comment. Enter to send, Shift + Enter for a new line."
				/>

				{attachments.length > 0 && (
					<div className="border-t border-zinc-900 px-3 py-3">
						<AttachmentGrid
							attachments={attachments}
							onRemove={removeAttachment}
						/>
					</div>
				)}

				<div className="flex items-center justify-between gap-3 border-t border-zinc-900 bg-zinc-900/30 px-2 py-2">
					<div className="flex min-w-0 items-center gap-2">
						<input
							ref={fileInputRef}
							type="file"
							accept="image/png,image/jpeg,image/webp,image/gif"
							multiple
							className="hidden"
							onChange={handleAttachmentSelect}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => fileInputRef.current?.click()}
							title="Attach images"
							className="h-9 w-9"
						>
							<Plus className="h-4 w-4" />
						</Button>
						<div className="min-w-0">
							<div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600">
								<ImageIcon className="h-3.5 w-3.5 shrink-0" />
								<span className="truncate">
									{attachments.length > 0
										? `${attachments.length} image${
												attachments.length === 1 ? "" : "s"
											} attached`
										: "Attach images"}
								</span>
							</div>
							{attachmentError && (
								<p className="mt-0.5 text-[11px] font-medium text-red-300">
									{attachmentError}
								</p>
							)}
						</div>
					</div>

					<Button
						type="button"
						onClick={handleCreateComment}
						disabled={createComment.isPending || !canSend}
						className="shrink-0"
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

			<ConfirmDialog
				open={!!deleteTarget}
				title="Delete comment"
				description="This removes the comment from the task conversation."
				confirmLabel="Delete"
				isDanger
				isLoading={deleteComment.isPending}
				confirmIcon={<Trash2 className="h-4 w-4" />}
				onConfirm={handleDeleteComment}
				onClose={() => setDeleteTarget(null)}
			/>
		</section>
	);
};
