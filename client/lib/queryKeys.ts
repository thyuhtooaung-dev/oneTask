export const queryKeys = {
	workspaces: {
		all: () => ["workspaces"] as const,
		detail: (workspaceId: string) => ["workspaces", workspaceId] as const,
		invites: (workspaceId: string) =>
			["workspaces", workspaceId, "invites"] as const,
		activities: (workspaceId: string) =>
			["workspaces", workspaceId, "activities"] as const,
		projects: (workspaceId: string) =>
			["workspaces", workspaceId, "projects"] as const,
		tasks: (workspaceId: string) =>
			["workspaces", workspaceId, "tasks"] as const,
	},
	tasks: {
		detail: (taskId: string) => ["tasks", taskId] as const,
		comments: (taskId: string) => ["tasks", taskId, "comments"] as const,
	},
};
