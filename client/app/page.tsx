"use client";

import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { DashboardLayout } from "@/features/workspace/components/DashboardLayout";
import { useWorkspaces } from "@/features/workspace/hooks/useWorkspaceData";
import { useUIStore } from "@/features/workspace/store/uiStore";
import { Briefcase, Layers, Sparkles } from "lucide-react";
import React from "react";

export default function Home() {
	const { activeWorkspaceId, activeProjectId } = useUIStore();
	const { data: workspaces = [] } = useWorkspaces();
	const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

	return (
		<AuthGuard>
			<DashboardLayout>
				{!activeWorkspaceId ? (
					<div className="flex flex-col items-center justify-center min-h-[50vh] text-center select-none animate-fade-in">
						<div className="h-16 w-16 bg-linear-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6">
							<Sparkles className="h-8 w-8 text-white animate-pulse" />
						</div>
						<h2 className="text-2xl font-bold text-white mb-2 tracking-wide">
							Welcome to oneTask
						</h2>
						<p className="text-sm text-zinc-500 max-w-sm mb-6 font-medium">
							Every action is an event. Select or launch a workspace in the
							sidebar to begin collaborating in realtime.
						</p>
					</div>
				) : !activeProjectId ? (
					<div className="space-y-6 animate-fade-in">
						<div className="border border-zinc-900/60 bg-zinc-950/20 rounded-2xl p-6 backdrop-blur-md">
							<h2 className="text-xl font-bold text-white mb-1 tracking-wide">
								{activeWorkspace?.name} Feed
							</h2>
							<p className="text-xs text-zinc-500 font-medium">
								Unified workspace activity timeline will be fully synchronized
								here in real time.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="border border-zinc-900/40 bg-zinc-950/10 rounded-2xl p-6 flex items-start gap-4">
								<div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
									<Briefcase className="h-5 w-5" />
								</div>
								<div>
									<h3 className="text-sm font-bold text-white mb-1">
										Create a Project
									</h3>
									<p className="text-xs text-zinc-500 font-medium mb-3">
										Organize your workspace events by creating target projects
										in the sidebar.
									</p>
								</div>
							</div>
							<div className="border border-zinc-900/40 bg-zinc-950/10 rounded-2xl p-6 flex items-start gap-4">
								<div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
									<Layers className="h-5 w-5" />
								</div>
								<div>
									<h3 className="text-sm font-bold text-white mb-1">
										Event Loop Integration
									</h3>
									<p className="text-xs text-zinc-500 font-medium mb-3">
										Every task created, comment posted, or status updated is
										tracked chronologically.
									</p>
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-6 animate-fade-in">
						<div className="border border-zinc-900/60 bg-zinc-950/20 rounded-2xl p-6 backdrop-blur-md">
							<h2 className="text-xl font-bold text-white mb-1 tracking-wide">
								Task List View
							</h2>
							<p className="text-xs text-zinc-500 font-medium">
								Task table and creation tools (Step 3 & Step 4) will go here.
							</p>
						</div>
					</div>
				)}
			</DashboardLayout>
		</AuthGuard>
	);
}
