"use client";

import { ChevronRight, Home } from "lucide-react";
import type React from "react";
import { useProjects, useWorkspaces } from "../hooks/useWorkspaceData";
import { useUIStore } from "../store/uiStore";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
	children,
}) => {
	const { activeWorkspaceId, activeProjectId } = useUIStore();
	const { data: workspaces = [] } = useWorkspaces();
	const { data: projects = [] } = useProjects(activeWorkspaceId);

	const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
	const activeProject = projects.find((p) => p.id === activeProjectId);

	return (
		<div className="flex h-screen w-screen overflow-hidden bg-linear-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100 font-sans">
			{/* Sidebar Panel */}
			<Sidebar />

			{/* Main Page Panel */}
			<div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
				{/* Top Header & Breadcrumbs Panel */}
				<header className="h-16 border-b border-zinc-900/40 bg-zinc-950/20 backdrop-blur-md flex items-center justify-between px-8 z-10 select-none">
					<div className="flex items-center gap-2.5 text-sm text-zinc-500 font-medium">
						<Home className="h-4 w-4 text-zinc-600" />
						<ChevronRight className="h-3.5 w-3.5 text-zinc-700" />

						{activeWorkspace ? (
							<span className="text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer">
								{activeWorkspace.name}
							</span>
						) : (
							<span className="text-zinc-600 italic">No Active Workspace</span>
						)}

						{activeWorkspace && activeProject && (
							<>
								<ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
								<span className="text-indigo-400 font-semibold truncate max-w-[150px]">
									{activeProject.name}
								</span>
							</>
						)}

						{activeWorkspace && !activeProject && (
							<>
								<ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
								<span className="text-zinc-400 font-semibold">
									Workspace Feed
								</span>
							</>
						)}
					</div>

					<div className="flex items-center gap-3">
						<div
							className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
							title="System Status: Operational"
						/>
						<span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
							Sync Active
						</span>
					</div>
				</header>

				{/* Scrollable Contents Area */}
				<main className="flex-1 overflow-y-auto relative p-8">{children}</main>
			</div>
		</div>
	);
};
