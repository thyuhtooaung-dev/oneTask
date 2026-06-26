"use client";

import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { SocketContext } from "@/features/realtime/context/SocketContext";
import { GlobalSearch } from "@/features/search/components/GlobalSearch";
import { Badge } from "@/shared/ui/badge/Badge";
import { cn } from "@/shared/ui/cn";
import { ChevronRight, Home, Menu, Radio } from "lucide-react";
import type React from "react";
import { useContext, useState } from "react";
import { useProjects, useWorkspaces } from "../hooks/useWorkspaceData";
import { useUIStore } from "../store/uiStore";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
	children,
}) => {
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
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
		<div className="flex h-dvh w-screen overflow-hidden bg-background text-foreground">
			{isMobileNavOpen && (
				<button
					type="button"
					aria-label="Close navigation"
					className="fixed inset-0 z-40 bg-black/60 md:hidden"
					onClick={() => setIsMobileNavOpen(false)}
				/>
			)}
			<Sidebar
				isMobileOpen={isMobileNavOpen}
				onMobileClose={() => setIsMobileNavOpen(false)}
			/>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-surface-900 bg-surface-950/72 px-3 sm:px-4 lg:px-6">
					<nav
						aria-label="Workspace context"
						className="flex min-w-0 items-center gap-2 text-xs font-medium text-surface-500"
					>
						<button
							type="button"
							aria-label="Open navigation"
							onClick={() => setIsMobileNavOpen(true)}
							className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-surface-900 text-surface-400 transition-colors hover:bg-surface-900 hover:text-surface-100 md:hidden"
						>
							<Menu className="h-4 w-4" />
						</button>
						<Home className="hidden h-4 w-4 text-surface-600 sm:block" />
						<ChevronRight className="hidden h-3.5 w-3.5 text-surface-700 sm:block" />
						<span
							className={cn(
								"hidden truncate sm:block",
								activeWorkspace ? "text-surface-300" : "text-surface-600",
							)}
						>
							{activeWorkspace?.name || "No workspace"}
						</span>
						<ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-surface-700 sm:block" />
						<span className="max-w-[45vw] truncate font-semibold text-primary-300 sm:max-w-none">
							{surfaceLabel}
						</span>
					</nav>

					<div className="flex shrink-0 items-center gap-2 sm:gap-3">
						<GlobalSearch workspaceId={activeWorkspaceId} />
						<NotificationBell />
						<Badge
							tone={isConnected ? "success" : "neutral"}
							className="hidden sm:inline-flex"
						>
							<Radio className="h-3 w-3" />
							<span className="hidden sm:inline">
								{isConnected ? "Realtime" : "Offline"}
							</span>
						</Badge>
						<span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-surface-600 sm:inline">
							Mutation → Event → Refresh
						</span>
					</div>
				</header>

				<main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
					{children}
				</main>
			</div>
		</div>
	);
};
