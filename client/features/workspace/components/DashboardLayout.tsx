"use client";

import { SocketContext } from "@/features/realtime/context/SocketContext";
import { Badge } from "@/shared/ui/badge/Badge";
import { cn } from "@/shared/ui/cn";
import { ChevronRight, Home, Radio } from "lucide-react";
import type React from "react";
import { useContext } from "react";
import { useProjects, useWorkspaces } from "../hooks/useWorkspaceData";
import { useUIStore } from "../store/uiStore";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
	children,
}) => {
	const { activeWorkspaceId, activeProjectId, showSettings } = useUIStore();
	const { isConnected } = useContext(SocketContext);
	const { data: workspaces = [] } = useWorkspaces();
	const { data: projects = [] } = useProjects(activeWorkspaceId);

	const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
	const activeProject = projects.find((p) => p.id === activeProjectId);
	const surfaceLabel = showSettings
		? "Members"
		: activeProject
			? activeProject.name
			: activeWorkspace
				? "Activity"
				: "Start";

	return (
		<div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
			<Sidebar />

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-900 bg-zinc-950/72 px-6">
					<nav
						aria-label="Workspace context"
						className="flex min-w-0 items-center gap-2 text-xs font-medium text-zinc-500"
					>
						<Home className="h-4 w-4 text-zinc-600" />
						<ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
						<span
							className={cn(
								"truncate",
								activeWorkspace ? "text-zinc-300" : "text-zinc-600",
							)}
						>
							{activeWorkspace?.name || "No workspace"}
						</span>
						<ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
						<span className="truncate font-semibold text-violet-300">
							{surfaceLabel}
						</span>
					</nav>

					<div className="flex items-center gap-3">
						<Badge tone={isConnected ? "success" : "neutral"}>
							<Radio className="h-3 w-3" />
							{isConnected ? "Realtime" : "Offline"}
						</Badge>
						<span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600 sm:inline">
							Mutation → Event → Refresh
						</span>
					</div>
				</header>

				<main className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
					{children}
				</main>
			</div>
		</div>
	);
};
