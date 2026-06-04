"use client";

import { useProjects } from "@/features/workspace/hooks/useWorkspaceData";
import { useUIStore } from "@/features/workspace/store/uiStore";
import {
	Activity,
	Bell,
	FilePlus2,
	Folder,
	FolderPlus,
	Settings,
	UserPlus,
} from "lucide-react";
import type React from "react";

export type WorkspaceCommandId =
	| "create-task"
	| "create-project"
	| "invite-member"
	| "open-notifications"
	| "open-settings"
	| "open-activity"
	| `go-project-${string}`;

export interface WorkspaceCommand {
	id: WorkspaceCommandId;
	title: string;
	subtitle: string;
	keywords: string[];
	icon: React.ElementType;
	disabled?: boolean;
	disabledReason?: string;
	run: () => void;
}

function includesQuery(command: WorkspaceCommand, query: string) {
	if (!query) return true;
	const haystack = [command.title, command.subtitle, ...command.keywords].join(
		" ",
	);
	return haystack.toLowerCase().includes(query);
}

export function useWorkspaceCommands(
	workspaceId: string | null,
	query: string,
) {
	const normalizedQuery = query.trim().toLowerCase();
	const { data: projects = [] } = useProjects(workspaceId);
	const {
		activeProjectId,
		setActiveProjectId,
		openCreateTaskModal,
		openCreateProjectModal,
		setShowSettings,
		setShowActivityExplorer,
		setNotificationsOpen,
	} = useUIStore();

	const firstProjectId = activeProjectId || projects[0]?.id || null;

	const commands: WorkspaceCommand[] = [
		{
			id: "create-task",
			title: "Create task",
			subtitle: firstProjectId
				? "Start a new task in the current workspace"
				: "Create a project before adding tasks",
			keywords: ["new task", "todo", "issue"],
			icon: FilePlus2,
			disabled: !firstProjectId,
			disabledReason: "No project available",
			run: () => {
				if (!firstProjectId) return;
				setActiveProjectId(firstProjectId);
				openCreateTaskModal();
			},
		},
		{
			id: "create-project",
			title: "Create project",
			subtitle: "Add a new project surface",
			keywords: ["new project", "folder"],
			icon: FolderPlus,
			run: openCreateProjectModal,
		},
		{
			id: "invite-member",
			title: "Invite member",
			subtitle: "Open workspace invites",
			keywords: ["member", "teammate", "email", "settings"],
			icon: UserPlus,
			run: () => setShowSettings(true),
		},
		{
			id: "open-notifications",
			title: "Open notifications",
			subtitle: "Review recent notifications",
			keywords: ["bell", "alerts", "inbox"],
			icon: Bell,
			run: () => setNotificationsOpen(true),
		},
		{
			id: "open-settings",
			title: "Open workspace settings",
			subtitle: "Manage members and access",
			keywords: ["members", "roles", "workspace"],
			icon: Settings,
			run: () => setShowSettings(true),
		},
		{
			id: "open-activity",
			title: "Open activity page",
			subtitle: "Browse workspace events",
			keywords: ["events", "activity", "explorer"],
			icon: Activity,
			run: () => setShowActivityExplorer(true),
		},
		...projects.map((project) => ({
			id: `go-project-${project.id}` as const,
			title: `Go to ${project.name}`,
			subtitle: "Project",
			keywords: ["project", "go", "open", project.name],
			icon: Folder,
			run: () => setActiveProjectId(project.id),
		})),
	];

	if (!workspaceId) return [];
	return commands.filter((command) => includesQuery(command, normalizedQuery));
}
