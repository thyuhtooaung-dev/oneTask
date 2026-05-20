import { create } from "zustand";

interface UIState {
	activeWorkspaceId: string | null;
	activeProjectId: string | null;
	selectedTaskId: string | null;
	isTaskModalOpen: boolean;
	isCreateTaskModalOpen: boolean;
	setActiveWorkspaceId: (id: string | null) => void;
	setActiveProjectId: (id: string | null) => void;
	openTaskModal: (taskId: string) => void;
	closeTaskModal: () => void;
	openCreateTaskModal: () => void;
	closeCreateTaskModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
	activeWorkspaceId: null,
	activeProjectId: null,
	selectedTaskId: null,
	isTaskModalOpen: false,
	isCreateTaskModalOpen: false,
	setActiveWorkspaceId: (id) =>
		set({
			activeWorkspaceId: id,
			activeProjectId: null, // Reset project selection when changing workspaces
			selectedTaskId: null,
			isTaskModalOpen: false,
			isCreateTaskModalOpen: false,
		}),
	setActiveProjectId: (id) => set({ activeProjectId: id }),
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
}));
