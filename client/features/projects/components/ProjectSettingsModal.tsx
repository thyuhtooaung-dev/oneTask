import {
	useArchiveProject,
	useUpdateProject,
} from "@/features/workspace/hooks/useWorkspaceData";
import { useUIStore } from "@/features/workspace/store/uiStore";
import { Button } from "@/shared/ui/button/Button";
import { Dialog } from "@/shared/ui/dialog/Dialog";
import { Archive, Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface ProjectSettingsModalProps {
	projectId: string;
	workspaceId: string;
	initialName: string;
	initialDescription?: string;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
	projectId,
	workspaceId,
	initialName,
	initialDescription = "",
}) => {
	const {
		isProjectSettingsModalOpen,
		closeProjectSettingsModal,
		setActiveProjectId,
	} = useUIStore();
	const [name, setName] = useState(initialName || "");
	const [description, setDescription] = useState(initialDescription || "");
	const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

	const updateProject = useUpdateProject(workspaceId);
	const archiveProject = useArchiveProject(workspaceId);

	const [prevIsOpen, setPrevIsOpen] = useState(isProjectSettingsModalOpen);
	const [prevProjectId, setPrevProjectId] = useState(projectId);

	// Reset state when modal opens or project changes
	if (
		projectId !== prevProjectId ||
		(isProjectSettingsModalOpen && !prevIsOpen)
	) {
		setPrevProjectId(projectId);
		setPrevIsOpen(isProjectSettingsModalOpen);
		setName(initialName);
		setDescription(initialDescription || "");
		setIsArchiveConfirmOpen(false);
	} else if (!isProjectSettingsModalOpen && prevIsOpen) {
		setPrevIsOpen(false);
	}

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		await updateProject.mutateAsync({
			projectId,
			name: name.trim(),
			description: description.trim() || undefined,
		});
		closeProjectSettingsModal();
	};

	const handleArchive = async () => {
		await archiveProject.mutateAsync(projectId);
		setIsArchiveConfirmOpen(false);
		closeProjectSettingsModal();
		setActiveProjectId(null); // Return to workspace overview
	};

	return (
		<Dialog
			open={isProjectSettingsModalOpen}
			title="Project settings"
			description="Manage project details and lifecycle."
			onClose={closeProjectSettingsModal}
		>
			<div className="p-5">
				<form onSubmit={handleUpdate} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="project-name" className="ot-label">
							Name
						</label>
						<input
							id="project-name"
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="ot-input h-10 px-3 text-sm"
							placeholder="Project name"
						/>
					</div>
					<div className="space-y-2">
						<label htmlFor="project-desc" className="ot-label">
							Description
						</label>
						<textarea
							id="project-desc"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="ot-input h-24 resize-none px-3 py-2 text-sm"
							placeholder="What is this project about?"
						/>
					</div>
					<div className="flex items-center justify-end">
						<Button
							type="submit"
							variant="primary"
							disabled={
								updateProject.isPending ||
								(name.trim() === (initialName || "") &&
									description.trim() === (initialDescription || ""))
							}
						>
							{updateProject.isPending && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Save changes
						</Button>
					</div>
				</form>

				<div className="my-6 h-px bg-zinc-900" />

				<div className="space-y-4">
					<div>
						<h4 className="text-sm font-semibold text-zinc-100">Danger Zone</h4>
						<p className="mt-1 text-xs text-zinc-500">
							Archiving a project hides it from the sidebar but keeps its tasks
							intact.
						</p>
					</div>

					<div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-4">
						<div>
							<p className="text-sm font-medium text-red-300">
								Archive project
							</p>
							<p className="text-xs text-red-400/80">
								This action will move the project out of the active workspace.
							</p>
						</div>
						<Button
							type="button"
							variant="danger"
							onClick={() => setIsArchiveConfirmOpen(true)}
						>
							<Archive className="mr-2 h-4 w-4" />
							Archive
						</Button>
					</div>
				</div>
			</div>

			<Dialog
				open={isArchiveConfirmOpen}
				title="Archive project?"
				description={`Are you sure you want to archive "${initialName}"?`}
				onClose={() => setIsArchiveConfirmOpen(false)}
			>
				<div className="flex items-center justify-end gap-3 p-5">
					<Button
						variant="ghost"
						onClick={() => setIsArchiveConfirmOpen(false)}
					>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={handleArchive}
						disabled={archiveProject.isPending}
					>
						{archiveProject.isPending && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						<Archive className="mr-2 h-4 w-4" />
						Archive project
					</Button>
				</div>
			</Dialog>
		</Dialog>
	);
};
