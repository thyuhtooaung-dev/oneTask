import { create } from "zustand";

interface UIState {
	activeWorkspaceId: string | null;
	activeProjectId: string | null;
	selectedTaskId: string | null;
	isTaskModalOpen: boolean;
	isCreateTaskModalOpen: boolean;
	viewMode: "list" | "board";
	showSettings: boolean;
	showActivityExplorer: boolean;
	setActiveWorkspaceId: (id: string | null) => void;
	setActiveProjectId: (id: string | null) => void;
	openTaskModal: (taskId: string) => void;
	closeTaskModal: () => void;
	openCreateTaskModal: () => void;
	closeCreateTaskModal: () => void;
	setViewMode: (mode: "list" | "board") => void;
	setShowSettings: (show: boolean) => void;
	setShowActivityExplorer: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
	activeWorkspaceId: null,
	activeProjectId: null,
	selectedTaskId: null,
	isTaskModalOpen: false,
	isCreateTaskModalOpen: false,
	viewMode: "list",
	showSettings: false,
	showActivityExplorer: false,
	setActiveWorkspaceId: (id) =>
		set({
			activeWorkspaceId: id,
			activeProjectId: null, // Reset project selection when changing workspaces
			selectedTaskId: null,
			isTaskModalOpen: false,
			isCreateTaskModalOpen: false,
			showSettings: false,
			showActivityExplorer: false,
		}),
	setActiveProjectId: (id) =>
		set({
			activeProjectId: id,
			showSettings: false,
			showActivityExplorer: false,
		}),
	openTaskModal: (taskId) =>
		set({
			selectedTaskId: taskId,
			isTaskModalOpen: true,
			isCreateTaskModalOpen: false,
		}),
	closeTaskModal: () => set({ selectedTaskId: null, isTaskModalOpen: false }),
	openCreateTaskModal: () =>
		set({
			selectedTaskId: null,
			isTaskModalOpen: false,
			isCreateTaskModalOpen: true,
		}),
	closeCreateTaskModal: () => set({ isCreateTaskModalOpen: false }),
	setViewMode: (mode) => set({ viewMode: mode }),
	setShowSettings: (show) =>
		set({
			showSettings: show,
			activeProjectId: null,
			showActivityExplorer: false,
		}),
	setShowActivityExplorer: (show) =>
		set({
			showActivityExplorer: show,
			activeProjectId: null,
			showSettings: false,
		}),
}));
