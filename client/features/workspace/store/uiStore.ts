import { create } from "zustand";

interface UIState {
	activeWorkspaceId: string | null;
	activeProjectId: string | null;
	selectedTaskId: string | null;
	isTaskModalOpen: boolean;
	isCreateTaskModalOpen: boolean;
	isCreateProjectModalOpen: boolean;
	isProjectSettingsModalOpen: boolean;
	viewMode: "list" | "board" | "files";
	showSettings: boolean;
	showActivityExplorer: boolean;
	showAnalytics: boolean;
	showReports: boolean;
	isNotificationsOpen: boolean;
	isUserProfileModalOpen: boolean;
	setActiveWorkspaceId: (id: string | null) => void;
	setActiveProjectId: (id: string | null) => void;
	openTaskModal: (taskId: string) => void;
	closeTaskModal: () => void;
	openCreateTaskModal: () => void;
	closeCreateTaskModal: () => void;
	openCreateProjectModal: () => void;
	closeCreateProjectModal: () => void;
	openProjectSettingsModal: () => void;
	closeProjectSettingsModal: () => void;
	setViewMode: (mode: "list" | "board" | "files") => void;
	setShowSettings: (show: boolean) => void;
	setShowActivityExplorer: (show: boolean) => void;
	setShowAnalytics: (show: boolean) => void;
	setShowReports: (show: boolean) => void;
	setNotificationsOpen: (open: boolean) => void;
	setUserProfileModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
	activeWorkspaceId: null,
	activeProjectId: null,
	selectedTaskId: null,
	isTaskModalOpen: false,
	isCreateTaskModalOpen: false,
	isCreateProjectModalOpen: false,
	isProjectSettingsModalOpen: false,
	viewMode: "list",
	showSettings: false,
	showActivityExplorer: false,
	showAnalytics: false,
	showReports: false,
	isNotificationsOpen: false,
	isUserProfileModalOpen: false,
	setActiveWorkspaceId: (id) =>
		set({
			activeWorkspaceId: id,
			activeProjectId: null, // Reset project selection when changing workspaces
			selectedTaskId: null,
			isTaskModalOpen: false,
			isCreateTaskModalOpen: false,
			isCreateProjectModalOpen: false,
			isProjectSettingsModalOpen: false,
			showSettings: false,
			showActivityExplorer: false,
			showAnalytics: false,
			showReports: false,
			isNotificationsOpen: false,
		}),
	setActiveProjectId: (id) =>
		set({
			activeProjectId: id,
			showSettings: false,
			showActivityExplorer: false,
			showAnalytics: false,
			showReports: false,
			isProjectSettingsModalOpen: false,
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
	openCreateProjectModal: () => set({ isCreateProjectModalOpen: true }),
	closeCreateProjectModal: () => set({ isCreateProjectModalOpen: false }),
	openProjectSettingsModal: () => set({ isProjectSettingsModalOpen: true }),
	closeProjectSettingsModal: () => set({ isProjectSettingsModalOpen: false }),
	setViewMode: (mode) => set({ viewMode: mode }),
	setShowSettings: (show) =>
		set({
			showSettings: show,
			activeProjectId: null,
			showActivityExplorer: false,
			showAnalytics: false,
			showReports: false,
		}),
	setShowActivityExplorer: (show) =>
		set({
			showActivityExplorer: show,
			activeProjectId: null,
			showSettings: false,
			showAnalytics: false,
			showReports: false,
		}),
	setShowAnalytics: (show) =>
		set({
			showAnalytics: show,
			activeProjectId: null,
			showSettings: false,
			showActivityExplorer: false,
			showReports: false,
		}),
	setShowReports: (show) =>
		set({
			showReports: show,
			activeProjectId: null,
			showSettings: false,
			showActivityExplorer: false,
			showAnalytics: false,
		}),
	setNotificationsOpen: (open) => set({ isNotificationsOpen: open }),
	setUserProfileModalOpen: (open) => set({ isUserProfileModalOpen: open }),
}));
