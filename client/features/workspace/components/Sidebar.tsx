"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import {
	Briefcase,
	ChevronDown,
	Folder,
	Layers,
	Loader2,
	LogOut,
	Plus,
	Sparkles,
	X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
	useCreateProject,
	useCreateWorkspace,
	useProjects,
	useWorkspaces,
} from "../hooks/useWorkspaceData";
import { useUIStore } from "../store/uiStore";

export const Sidebar: React.FC = () => {
	const { user, logout } = useAuth();
	const {
		activeWorkspaceId,
		activeProjectId,
		setActiveWorkspaceId,
		setActiveProjectId,
	} = useUIStore();

	// TanStack Query Hooks
	const { data: workspaces = [], isLoading: isLoadingWorkspaces } =
		useWorkspaces();
	const { data: projects = [], isLoading: isLoadingProjects } =
		useProjects(activeWorkspaceId);
	const createWorkspaceMutation = useCreateWorkspace();
	const createProjectMutation = useCreateProject(activeWorkspaceId);

	// UI State for custom glass modals
	const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
	const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

	// Form states
	const [workspaceName, setWorkspaceName] = useState("");
	const [workspaceDesc, setWorkspaceDesc] = useState("");
	const [projectName, setProjectName] = useState("");
	const [projectDesc, setProjectDesc] = useState("");

	// Selected workspace object
	const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

	const handleCreateWorkspace = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!workspaceName.trim()) return;

		try {
			const newWs = await createWorkspaceMutation.mutateAsync({
				name: workspaceName,
				description: workspaceDesc || undefined,
			});
			setActiveWorkspaceId(newWs.id);
			setWorkspaceName("");
			setWorkspaceDesc("");
			setIsWorkspaceModalOpen(false);
		} catch (err) {
			console.error("Failed to create workspace:", err);
		}
	};

	const handleCreateProject = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!projectName.trim() || !activeWorkspaceId) return;

		try {
			const newProj = await createProjectMutation.mutateAsync({
				name: projectName,
				description: projectDesc || undefined,
			});
			setActiveProjectId(newProj.id);
			setProjectName("");
			setProjectDesc("");
			setIsProjectModalOpen(false);
		} catch (err) {
			console.error("Failed to create project:", err);
		}
	};

	return (
		<aside className="w-72 min-h-screen backdrop-blur-xl bg-zinc-950/80 border-r border-zinc-900/50 flex flex-col justify-between text-zinc-300 relative select-none">
			<div className="flex flex-col flex-1 overflow-y-auto">
				{/* Logo Section */}
				<div className="p-6 flex items-center gap-3 border-b border-zinc-900/40">
					<div className="h-9 w-9 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
						<Sparkles className="h-5 w-5 text-white animate-pulse" />
					</div>
					<div>
						<h1 className="text-lg font-bold text-white tracking-wide">
							oneTask
						</h1>
						<span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">
							Event-Driven MVP
						</span>
					</div>
				</div>

				{/* Workspace Dropdown Panel */}
				<div className="p-4 border-b border-zinc-900/20">
					<label
						htmlFor="active-workspace-select"
						className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 block mb-1"
					>
						Active Workspace
					</label>
					<div className="relative group">
						{isLoadingWorkspaces ? (
							<div className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900/20 text-zinc-400 text-sm">
								<Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
								<span>Loading workspaces...</span>
							</div>
						) : (
							<div className="w-full">
								<select
									id="active-workspace-select"
									value={activeWorkspaceId || ""}
									onChange={(e) => {
										const val = e.target.value;
										setActiveWorkspaceId(val || null);
									}}
									className="w-full px-3 py-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/40 focus:border-indigo-500/50 text-white font-medium text-sm focus:outline-none appearance-none cursor-pointer pr-10"
								>
									<option value="" className="bg-zinc-900 text-zinc-400">
										Select a workspace...
									</option>
									{workspaces.map((ws) => (
										<option
											key={ws.id}
											value={ws.id}
											className="bg-zinc-900 text-white"
										>
											{ws.name}
										</option>
									))}
								</select>
								<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-500">
									<ChevronDown className="h-4 w-4" />
								</div>
							</div>
						)}
					</div>

					<button
						type="button"
						onClick={() => setIsWorkspaceModalOpen(true)}
						className="w-full mt-2.5 flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/30 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-all duration-300"
					>
						<Plus className="h-3.5 w-3.5" />
						<span>Create Workspace</span>
					</button>
				</div>

				{/* Projects Navigator Section */}
				<div className="flex-1 p-4">
					<div className="flex items-center justify-between px-2 mb-2">
						<span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
							Projects
						</span>
						{activeWorkspaceId && (
							<button
								type="button"
								onClick={() => setIsProjectModalOpen(true)}
								className="text-zinc-500 hover:text-white transition-colors duration-200"
							>
								<Plus className="h-4 w-4" />
							</button>
						)}
					</div>

					{!activeWorkspaceId ? (
						<div className="px-3 py-6 text-center border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/20">
							<Briefcase className="h-5 w-5 mx-auto text-zinc-700 mb-2" />
							<p className="text-xs text-zinc-600 font-medium">
								Select a workspace to view projects
							</p>
						</div>
					) : isLoadingProjects ? (
						<div className="flex items-center gap-2 px-3 py-3 text-sm text-zinc-500">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span>Loading projects...</span>
						</div>
					) : projects.length === 0 ? (
						<div className="px-3 py-6 text-center border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/20">
							<Folder className="h-5 w-5 mx-auto text-zinc-700 mb-2" />
							<p className="text-xs text-zinc-600 font-medium">
								No projects yet
							</p>
							<button
								type="button"
								onClick={() => setIsProjectModalOpen(true)}
								className="mt-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
							>
								Create one now
							</button>
						</div>
					) : (
						<div className="space-y-1">
							{/* Workspace General Feed Selector */}
							<button
								type="button"
								onClick={() => setActiveProjectId(null)}
								className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
									activeProjectId === null
										? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500"
										: "hover:bg-zinc-900/30 text-zinc-400 hover:text-zinc-200"
								}`}
							>
								<Layers className="h-4 w-4" />
								<span>Workspace Feed</span>
							</button>

							{/* Projects List */}
							{projects.map((proj) => (
								<button
									type="button"
									key={proj.id}
									onClick={() => setActiveProjectId(proj.id)}
									className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
										activeProjectId === proj.id
											? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500"
											: "hover:bg-zinc-900/30 text-zinc-400 hover:text-zinc-200"
									}`}
								>
									<Folder className="h-4 w-4" />
									<span className="truncate">{proj.name}</span>
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			{/* User Information & Settings Section */}
			{user && (
				<div className="p-4 border-t border-zinc-900/40 bg-zinc-950/40 backdrop-blur-md">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="h-9 w-9 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 text-indigo-400 font-bold uppercase shadow-inner">
								{user.name ? user.name[0] : user.email[0]}
							</div>
							<div className="min-w-0">
								<h3 className="text-xs font-bold text-white truncate">
									{user.name || "Anonymous User"}
								</h3>
								<span className="text-[10px] text-zinc-500 truncate block">
									{user.email}
								</span>
							</div>
						</div>
						<button
							type="button"
							onClick={logout}
							className="p-2 hover:bg-zinc-900/60 rounded-xl text-zinc-500 hover:text-red-400 transition-all duration-200"
							title="Logout"
						>
							<LogOut className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			{/* CUSTOM GLASS WORKSPACE CREATION MODAL */}
			{isWorkspaceModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
					<div className="bg-zinc-900/90 border border-zinc-800/60 rounded-2xl p-6 w-full max-w-md shadow-2xl backdrop-blur-md relative transform scale-100 transition-all duration-300">
						<button
							type="button"
							onClick={() => setIsWorkspaceModalOpen(false)}
							className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 hover:bg-zinc-800 rounded-lg transition-colors"
						>
							<X className="h-4 w-4" />
						</button>
						<h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
							<Sparkles className="h-5 w-5 text-indigo-400 animate-spin" />
							<span>Create Workspace</span>
						</h2>
						<form onSubmit={handleCreateWorkspace} className="space-y-4">
							<div>
								<label
									htmlFor="workspace-name-input"
									className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block"
								>
									Workspace Name
								</label>
								<input
									id="workspace-name-input"
									type="text"
									required
									placeholder="e.g. Acme Corporation, Marketing"
									value={workspaceName}
									onChange={(e) => setWorkspaceName(e.target.value)}
									className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-white"
								/>
							</div>
							<div>
								<label
									htmlFor="workspace-desc-textarea"
									className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block"
								>
									Description (Optional)
								</label>
								<textarea
									id="workspace-desc-textarea"
									placeholder="Tell us about this workspace..."
									value={workspaceDesc}
									onChange={(e) => setWorkspaceDesc(e.target.value)}
									className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-white h-20 resize-none"
								/>
							</div>
							<button
								type="submit"
								disabled={createWorkspaceMutation.isPending}
								className="w-full py-2.5 bg-linear-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold text-xs tracking-wider transition-all duration-300 shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2"
							>
								{createWorkspaceMutation.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<span>Launch Workspace</span>
								)}
							</button>
						</form>
					</div>
				</div>
			)}

			{/* CUSTOM GLASS PROJECT CREATION MODAL */}
			{isProjectModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
					<div className="bg-zinc-900/90 border border-zinc-800/60 rounded-2xl p-6 w-full max-w-md shadow-2xl backdrop-blur-md relative transform scale-100 transition-all duration-300">
						<button
							type="button"
							onClick={() => setIsProjectModalOpen(false)}
							className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 hover:bg-zinc-800 rounded-lg transition-colors"
						>
							<X className="h-4 w-4" />
						</button>
						<h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
							<Folder className="h-5 w-5 text-indigo-400" />
							<span>Create Project</span>
						</h2>
						<p className="text-xs text-zinc-500 mb-4">
							Adding project to workspace{" "}
							<strong className="text-zinc-300">{activeWorkspace?.name}</strong>
						</p>
						<form onSubmit={handleCreateProject} className="space-y-4">
							<div>
								<label
									htmlFor="project-name-input"
									className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block"
								>
									Project Name
								</label>
								<input
									id="project-name-input"
									type="text"
									required
									placeholder="e.g. Website Redesign, Q2 Planning"
									value={projectName}
									onChange={(e) => setProjectName(e.target.value)}
									className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-white"
								/>
							</div>
							<div>
								<label
									htmlFor="project-desc-textarea"
									className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 block"
								>
									Description (Optional)
								</label>
								<textarea
									id="project-desc-textarea"
									placeholder="What is this project focused on?"
									value={projectDesc}
									onChange={(e) => setProjectDesc(e.target.value)}
									className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-800 focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-white h-20 resize-none"
								/>
							</div>
							<button
								type="submit"
								disabled={createProjectMutation.isPending}
								className="w-full py-2.5 bg-linear-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold text-xs tracking-wider transition-all duration-300 shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2"
							>
								{createProjectMutation.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<span>Launch Project</span>
								)}
							</button>
						</form>
					</div>
				</div>
			)}
		</aside>
	);
};
