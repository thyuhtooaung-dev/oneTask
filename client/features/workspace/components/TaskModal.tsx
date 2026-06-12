"use client";

import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { ConfirmDialog } from "@/shared/ui/dialog/ConfirmDialog";
import { Dialog } from "@/shared/ui/dialog/Dialog";
import { Drawer } from "@/shared/ui/drawer/Drawer";
import { DropdownMenu } from "@/shared/ui/dropdown-menu/DropdownMenu";
import {
	AlertOctagon,
	ChevronDown,
	Loader2,
	Minus,
	Save,
	Settings,
	SignalHigh,
	SignalLow,
	SignalMedium,
	Trash2,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import {
	type Task,
	type TaskPriority,
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

const PRIORITY_OPTIONS: Array<{
	value: TaskPriority;
	label: string;
	icon: React.ElementType;
	color: string;
}> = [
	{ value: "none", label: "No priority", icon: Minus, color: "text-zinc-500" },
	{ value: "low", label: "Low", icon: SignalLow, color: "text-zinc-400" },
	{
		value: "medium",
		label: "Medium",
		icon: SignalMedium,
		color: "text-yellow-400",
	},
	{ value: "high", label: "High", icon: SignalHigh, color: "text-orange-400" },
	{
		value: "urgent",
		label: "Urgent",
		icon: AlertOctagon,
		color: "text-red-500",
	},
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
	const [priority, setPriority] = useState<TaskPriority>("none");
	const [dueDate, setDueDate] = useState<string>("");
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [isControlsModalOpen, setIsControlsModalOpen] = useState(false);

	const [prevTask, setPrevTask] = useState<Task | undefined>(undefined);
	const [prevIsOpen, setPrevIsOpen] = useState(false);

	if (task?.id !== prevTask?.id || isOpen !== prevIsOpen) {
		setPrevTask(task);
		setPrevIsOpen(isOpen);
		if (isOpen) {
			setTitle(task?.title || "");
			setDescription(task?.description || "");
			setStatus(task?.status || "todo");
			setAssigneeId(task?.assigneeId || "");
			setPriority(task?.priority || "none");
			setDueDate(task?.dueDate ? task.dueDate.split("T")[0] : "");
			setIsDeleteConfirmOpen(false);
			setIsControlsModalOpen(false);
		}
	}

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
				priority,
				dueDate: dueDate || null,
				projectId,
				assigneeId: assigneeId || null,
			});
		} else if (task) {
			await updateTask.mutateAsync({
				taskId: task.id,
				title: title.trim(),
				description: description.trim() || null,
				status,
				priority,
				dueDate: dueDate || null,
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

	const taskDetailsForm = (
		<>
			<form
				onSubmit={handleSubmit}
				className="flex min-h-full flex-col gap-4 p-4 sm:gap-6 sm:p-6"
			>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<label htmlFor={`${mode}-task-title`} className="ot-label">
							Title
						</label>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() => setIsControlsModalOpen(true)}
							title="Task controls"
							className="h-8 w-8"
						>
							<Settings className="h-4 w-4" />
						</Button>
					</div>
					<input
						id={`${mode}-task-title`}
						required
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						className="ot-input min-h-11 px-3 text-sm font-medium"
						placeholder="Write a clear task title"
					/>
				</div>

				<div className="space-y-2 flex-1">
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

				<div className="mt-auto flex flex-col-reverse gap-3 border-t border-zinc-900 pt-4 sm:flex-row sm:items-center sm:justify-end">
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
			</form>

			<Dialog
				open={isControlsModalOpen}
				title="Task Controls"
				description="Update status, assignee, priority, and due dates."
				onClose={() => setIsControlsModalOpen(false)}
			>
				<div className="space-y-4 p-4 sm:p-6">
					<div className="space-y-2">
						<label htmlFor={`${mode}-task-status`} className="ot-label">
							Status
						</label>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild>
								<button
									id={`${mode}-task-status`}
									type="button"
									className="ot-input flex min-h-10 w-full items-center justify-between gap-3 px-3 text-left text-sm font-medium"
								>
									<span className="truncate text-zinc-100">
										{STATUS_OPTIONS.find((opt) => opt.value === status)
											?.label || "Select status"}
									</span>
									<ChevronDown className="h-4 w-4 shrink-0 text-zinc-600" />
								</button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content
								align="start"
								className="w-(--radix-dropdown-menu-trigger-width) max-w-[calc(100vw-2rem)]"
							>
								<DropdownMenu.Label>Status</DropdownMenu.Label>
								<DropdownMenu.RadioGroup
									value={status}
									onValueChange={(val) => setStatus(val as TaskStatus)}
								>
									{STATUS_OPTIONS.map((option) => (
										<DropdownMenu.RadioItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</DropdownMenu.RadioItem>
									))}
								</DropdownMenu.RadioGroup>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
						{activeStatus && (
							<Badge tone={activeStatus.tone}>{activeStatus.label}</Badge>
						)}
					</div>

					<div className="space-y-2">
						<label htmlFor={`${mode}-task-assignee`} className="ot-label">
							Assignee
						</label>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild>
								<button
									id={`${mode}-task-assignee`}
									type="button"
									className="ot-input flex min-h-10 w-full items-center justify-between gap-3 px-3 text-left text-sm font-medium"
								>
									<span className="truncate text-zinc-100">
										{assigneeId === ""
											? "Unassigned"
											: members.find((m) => m.userId === assigneeId)?.user
													?.name ||
												members.find((m) => m.userId === assigneeId)?.user
													?.email ||
												assigneeId}
									</span>
									<ChevronDown className="h-4 w-4 shrink-0 text-zinc-600" />
								</button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content
								align="start"
								className="w-(--radix-dropdown-menu-trigger-width) max-w-[calc(100vw-2rem)] max-h-[300px]"
							>
								<DropdownMenu.Label>Assignee</DropdownMenu.Label>
								<DropdownMenu.RadioGroup
									value={assigneeId}
									onValueChange={setAssigneeId}
								>
									<DropdownMenu.RadioItem value="">
										Unassigned
									</DropdownMenu.RadioItem>
									{members.map((member) => (
										<DropdownMenu.RadioItem
											key={member.userId}
											value={member.userId}
										>
											<span className="truncate">
												{member.user?.name ||
													member.user?.email ||
													member.userId}
											</span>
										</DropdownMenu.RadioItem>
									))}
								</DropdownMenu.RadioGroup>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>

					<div className="space-y-2">
						<label htmlFor={`${mode}-task-priority`} className="ot-label">
							Priority
						</label>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild>
								<button
									id={`${mode}-task-priority`}
									type="button"
									className="ot-input flex min-h-10 w-full items-center justify-between gap-3 px-3 text-left text-sm font-medium"
								>
									<div className="flex items-center gap-2 text-zinc-100">
										{(() => {
											const option = PRIORITY_OPTIONS.find(
												(opt) => opt.value === priority,
											);
											if (!option) return null;
											const Icon = option.icon;
											return <Icon className={`h-4 w-4 ${option.color}`} />;
										})()}
										<span className="truncate">
											{
												PRIORITY_OPTIONS.find((opt) => opt.value === priority)
													?.label
											}
										</span>
									</div>
									<ChevronDown className="h-4 w-4 shrink-0 text-zinc-600" />
								</button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content
								align="start"
								className="w-(--radix-dropdown-menu-trigger-width) max-w-[calc(100vw-2rem)]"
							>
								<DropdownMenu.Label>Priority</DropdownMenu.Label>
								<DropdownMenu.RadioGroup
									value={priority}
									onValueChange={(val) => setPriority(val as TaskPriority)}
								>
									{PRIORITY_OPTIONS.map((option) => (
										<DropdownMenu.RadioItem
											key={option.value}
											value={option.value}
										>
											<div className="flex items-center gap-2">
												<option.icon className={`h-4 w-4 ${option.color}`} />
												{option.label}
											</div>
										</DropdownMenu.RadioItem>
									))}
								</DropdownMenu.RadioGroup>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>

					<div className="space-y-2">
						<label htmlFor={`${mode}-task-duedate`} className="ot-label">
							Due Date
						</label>
						<input
							id={`${mode}-task-duedate`}
							type="date"
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
							className="ot-input flex min-h-10 w-full px-3 text-sm font-medium text-zinc-100 scheme-dark"
						/>
					</div>

					<div className="flex justify-end border-t border-zinc-900 pt-4">
						<Button
							type="button"
							variant="primary"
							onClick={() => setIsControlsModalOpen(false)}
						>
							Done
						</Button>
					</div>
				</div>
			</Dialog>
		</>
	);

	const editContent = (
		<div className="min-h-full space-y-4">
			{taskDetailsForm}
			{task && (
				<section className="mx-4 mb-4 rounded-2xl border border-zinc-900 bg-zinc-950/45 p-4 sm:mx-6 sm:mb-6 sm:p-5">
					<TaskComments taskId={task.id} workspaceId={workspaceId} />
				</section>
			)}
		</div>
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
				{taskDetailsForm}
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
				{editContent}
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
