"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { Button } from "@/shared/ui/button/Button";
import { cn } from "@/shared/ui/cn";
import { Dialog } from "@/shared/ui/dialog/Dialog";
import { DropdownMenu } from "@/shared/ui/dropdown-menu/DropdownMenu";
import {
	Activity,
	Briefcase,
	ChevronDown,
	Folder,
	Inbox,
	Loader2,
	LogOut,
	PanelLeftClose,
	PanelLeftOpen,
	Plus,
	Settings,
} from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useState } from "react";
import {
	useCreateProject,
	useCreateWorkspace,
	useProjects,
	useWorkspaces,
} from "../hooks/useWorkspaceData";
import { useUIStore } from "../store/uiStore";

function NavItem({
	active,
	icon: Icon,
	label,
	onClick,
	collapsed = false,
}: {
	active?: boolean;
	icon: React.ElementType;
	label: string;
	onClick: () => void;
	collapsed?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			title={collapsed ? label : undefined}
			className={cn(
				"flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
				collapsed && "justify-center px-0",
				active
					? "bg-violet-500/10 text-violet-200 shadow-[inset_2px_0_0_var(--ot-accent)]"
					: "text-zinc-400 hover:bg-zinc-900/70 hover:text-zinc-100",
			)}
		>
			<Icon className="h-4 w-4 shrink-0" />
			{!collapsed && <span className="truncate">{label}</span>}
		</button>
	);
}

function useViewportMode() {
	const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">(
		"desktop",
	);

	useEffect(() => {
		const update = () => {
			if (window.innerWidth < 768) setViewport("mobile");
			else if (window.innerWidth < 1024) setViewport("tablet");
			else setViewport("desktop");
		};

		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	return viewport;
}

interface SidebarProps {
	isMobileOpen?: boolean;
	onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
	isMobileOpen = false,
	onMobileClose,
}) => {
	const { user, logout } = useAuth();
	const {
		activeWorkspaceId,
		activeProjectId,
		showSettings,
		showActivityExplorer,
		setActiveWorkspaceId,
		setActiveProjectId,
		setShowSettings,
		setShowActivityExplorer,
	} = useUIStore();

	const { data: workspaces = [], isLoading: isLoadingWorkspaces } =
		useWorkspaces();
	const { data: projects = [], isLoading: isLoadingProjects } =
		useProjects(activeWorkspaceId);
	const createWorkspaceMutation = useCreateWorkspace();
	const createProjectMutation = useCreateProject(activeWorkspaceId);

	const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
	const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
	const [userCollapsed, setUserCollapsed] = useState<boolean | null>(null);
	const [workspaceName, setWorkspaceName] = useState("");
	const [workspaceDesc, setWorkspaceDesc] = useState("");
	const [projectName, setProjectName] = useState("");
	const [projectDesc, setProjectDesc] = useState("");

	const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
	const viewport = useViewportMode();
	const isMobile = viewport === "mobile";
	const isSidebarCompact =
		!isMobile && (userCollapsed ?? viewport === "tablet");

	const handleNavigate = (callback: () => void) => {
		callback();
		onMobileClose?.();
	};

	const handleCreateWorkspace = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!workspaceName.trim()) return;

		const workspace = await createWorkspaceMutation.mutateAsync({
			name: workspaceName.trim(),
			description: workspaceDesc.trim() || undefined,
		});
		setActiveWorkspaceId(workspace.id);
		setWorkspaceName("");
		setWorkspaceDesc("");
		setIsWorkspaceModalOpen(false);
		onMobileClose?.();
	};

	const handleCreateProject = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!projectName.trim() || !activeWorkspaceId) return;

		const project = await createProjectMutation.mutateAsync({
			name: projectName.trim(),
			description: projectDesc.trim() || undefined,
		});
		setActiveProjectId(project.id);
		setProjectName("");
		setProjectDesc("");
		setIsProjectModalOpen(false);
		onMobileClose?.();
	};

	return (
		<aside
			className={cn(
				"fixed inset-y-0 left-0 z-50 flex h-dvh shrink-0 flex-col border-r border-zinc-900 bg-zinc-950 text-zinc-300 shadow-(--ot-shadow-panel) transition-[transform,width] duration-200 ease-out md:static md:z-auto md:translate-x-0 md:bg-zinc-950/82 md:shadow-none",
				isMobileOpen ? "translate-x-0" : "-translate-x-full",
				isSidebarCompact ? "w-16" : "w-[min(20rem,calc(100vw-1rem))]",
			)}
		>
			<div
				className={cn(
					"flex h-14 shrink-0 items-center border-b border-zinc-900 px-3",
					isSidebarCompact ? "justify-center" : "gap-3",
				)}
			>
				{isSidebarCompact ? (
					<>
						{!isMobile && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setUserCollapsed(false)}
								title="Expand sidebar"
								className="hidden md:inline-flex"
							>
								<PanelLeftOpen className="h-4 w-4" />
							</Button>
						)}
						<div className="relative flex h-8 w-8 overflow-hidden rounded-lg shadow-[0_10px_30px_rgba(124,58,237,0.24)] lg:hidden">
							<Image
								src="/logo.jpg"
								alt="oneTask Logo"
								fill
								className="object-cover"
							/>
						</div>
					</>
				) : (
					<>
						<div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-[0_10px_30px_rgba(124,58,237,0.28)]">
							<Image
								src="/logo.jpg"
								alt="oneTask Logo"
								fill
								className="object-cover"
							/>
						</div>
						<div className="min-w-0 flex-1">
							<h1 className="text-sm font-semibold tracking-tight text-zinc-100">
								oneTask
							</h1>
							<p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">
								Event OS
							</p>
						</div>
						{!isMobile && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setUserCollapsed(true)}
								title="Collapse sidebar"
								className="hidden md:inline-flex"
							>
								<PanelLeftClose className="h-4 w-4" />
							</Button>
						)}
					</>
				)}
			</div>

			<div
				className={cn(
					"min-h-0 flex-1 overflow-y-auto py-4",
					isSidebarCompact ? "px-2" : "px-3",
				)}
			>
				{isSidebarCompact ? (
					<section className="space-y-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsWorkspaceModalOpen(true)}
							title="Create workspace"
							className="w-full"
						>
							<Plus className="h-4 w-4" />
						</Button>
						{activeWorkspaceId ? (
							<>
								<NavItem
									active={
										!activeProjectId && !showSettings && !showActivityExplorer
									}
									icon={Inbox}
									label="Workspace overview"
									onClick={() => handleNavigate(() => setActiveProjectId(null))}
									collapsed
								/>
								<NavItem
									active={showActivityExplorer}
									icon={Activity}
									label="Event Explorer"
									onClick={() =>
										handleNavigate(() => setShowActivityExplorer(true))
									}
									collapsed
								/>
								<NavItem
									active={showSettings}
									icon={Settings}
									label="Members & settings"
									onClick={() => handleNavigate(() => setShowSettings(true))}
									collapsed
								/>
								<div className="my-3 h-px bg-zinc-900" />
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setIsProjectModalOpen(true)}
									title="Create project"
									className="w-full"
								>
									<Plus className="h-4 w-4" />
								</Button>
								{projects.map((project) => (
									<NavItem
										key={project.id}
										active={activeProjectId === project.id}
										icon={Folder}
										label={project.name}
										onClick={() =>
											handleNavigate(() => setActiveProjectId(project.id))
										}
										collapsed
									/>
								))}
							</>
						) : (
							<div className="flex h-9 items-center justify-center text-zinc-700">
								<Briefcase className="h-4 w-4" />
							</div>
						)}
					</section>
				) : (
					<>
						<section className="space-y-2">
							<div className="flex items-center justify-between px-2">
								<label htmlFor="active-workspace-select" className="ot-label">
									Workspace
								</label>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setIsWorkspaceModalOpen(true)}
									title="Create workspace"
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>

							{isLoadingWorkspaces ? (
								<div className="flex items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-sm text-zinc-500">
									<Loader2 className="h-4 w-4 animate-spin" />
									Loading
								</div>
							) : (
								<DropdownMenu.Root>
									<DropdownMenu.Trigger asChild>
										<button
											id="active-workspace-select"
											type="button"
											className="ot-input flex min-h-10 items-center justify-between gap-3 px-3 text-left text-sm font-medium"
										>
											<span
												className={cn(
													"truncate",
													activeWorkspace ? "text-zinc-100" : "text-zinc-500",
												)}
											>
												{activeWorkspace?.name || "Select workspace"}
											</span>
											<ChevronDown className="h-4 w-4 shrink-0 text-zinc-600" />
										</button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content
										align="start"
										className="w-(--radix-dropdown-menu-trigger-width) max-w-[calc(100vw-2rem)]"
									>
										<DropdownMenu.Label>Workspace</DropdownMenu.Label>
										<DropdownMenu.RadioGroup
											value={activeWorkspaceId || ""}
											onValueChange={(value) => {
												if (!value) return;
												setActiveWorkspaceId(value);
												onMobileClose?.();
											}}
										>
											{workspaces.length === 0 && (
												<DropdownMenu.Item disabled>
													No workspaces yet
												</DropdownMenu.Item>
											)}
											{workspaces.map((workspace) => (
												<DropdownMenu.RadioItem
													key={workspace.id}
													value={workspace.id}
												>
													<span className="truncate">{workspace.name}</span>
												</DropdownMenu.RadioItem>
											))}
										</DropdownMenu.RadioGroup>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							)}
						</section>

						<section className="mt-6 space-y-2">
							<div className="flex items-center justify-between px-2">
								<span className="ot-label">Context</span>
								{activeWorkspaceId && (
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setIsProjectModalOpen(true)}
										title="Create project"
									>
										<Plus className="h-4 w-4" />
									</Button>
								)}
							</div>

							{!activeWorkspaceId ? (
								<div className="rounded-xl border border-dashed border-zinc-900 bg-zinc-950/60 px-4 py-8 text-center">
									<Briefcase className="mx-auto mb-2 h-5 w-5 text-zinc-700" />
									<p className="text-xs font-medium leading-5 text-zinc-600">
										Choose a workspace to load projects and activity.
									</p>
								</div>
							) : (
								<div className="space-y-1">
									<NavItem
										active={
											!activeProjectId && !showSettings && !showActivityExplorer
										}
										icon={Inbox}
										label="Workspace overview"
										onClick={() =>
											handleNavigate(() => setActiveProjectId(null))
										}
									/>
									<NavItem
										active={showActivityExplorer}
										icon={Activity}
										label="Event Explorer"
										onClick={() =>
											handleNavigate(() => setShowActivityExplorer(true))
										}
									/>
									<NavItem
										active={showSettings}
										icon={Settings}
										label="Members & settings"
										onClick={() => handleNavigate(() => setShowSettings(true))}
									/>
									<div className="my-3 h-px bg-zinc-900" />
									{isLoadingProjects ? (
										<div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500">
											<Loader2 className="h-4 w-4 animate-spin" />
											Loading projects
										</div>
									) : projects.length === 0 ? (
										<div className="rounded-xl border border-dashed border-zinc-900 bg-zinc-950/50 px-4 py-6 text-center">
											<Folder className="mx-auto mb-2 h-5 w-5 text-zinc-700" />
											<p className="text-xs text-zinc-600">No projects yet.</p>
											<button
												type="button"
												onClick={() => setIsProjectModalOpen(true)}
												className="mt-2 text-xs font-semibold text-violet-300 hover:text-violet-200"
											>
												Create project
											</button>
										</div>
									) : (
										projects.map((project) => (
											<NavItem
												key={project.id}
												active={activeProjectId === project.id}
												icon={Folder}
												label={project.name}
												onClick={() =>
													handleNavigate(() => setActiveProjectId(project.id))
												}
											/>
										))
									)}
								</div>
							)}
						</section>
					</>
				)}
			</div>

			{user && (
				<div
					className={cn(
						"border-t border-zinc-900",
						isSidebarCompact ? "p-2" : "p-3",
					)}
				>
					<div
						className={cn(
							"flex items-center rounded-xl border border-zinc-900 bg-zinc-950/80 p-2",
							isSidebarCompact ? "flex-col gap-2" : "justify-between",
						)}
					>
						<div className="flex min-w-0 items-center gap-3">
							<Avatar name={user.name} email={user.email} size="md" />
							{!isSidebarCompact && (
								<div className="min-w-0">
									<p className="truncate text-xs font-semibold text-zinc-100">
										{user.name || "Anonymous User"}
									</p>
									<p className="truncate text-[10px] text-zinc-600">
										{user.email}
									</p>
								</div>
							)}
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsLogoutDialogOpen(true)}
							title="Log out"
						>
							<LogOut className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			<Dialog
				open={isLogoutDialogOpen}
				title="Log out?"
				description="Are you sure you want to log out of oneTask?"
				onClose={() => setIsLogoutDialogOpen(false)}
			>
				<div className="flex items-center justify-end gap-3 p-5">
					<Button variant="ghost" onClick={() => setIsLogoutDialogOpen(false)}>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={() => {
							setIsLogoutDialogOpen(false);
							logout();
						}}
					>
						<LogOut className="h-4 w-4" />
						Log out
					</Button>
				</div>
			</Dialog>

			<Dialog
				open={isWorkspaceModalOpen}
				title="Create workspace"
				description="Workspaces preserve context for teams, projects, events, and members."
				onClose={() => setIsWorkspaceModalOpen(false)}
			>
				<form onSubmit={handleCreateWorkspace} className="space-y-4 p-5">
					<div className="space-y-2">
						<label htmlFor="workspace-name-input" className="ot-label">
							Name
						</label>
						<input
							id="workspace-name-input"
							required
							value={workspaceName}
							onChange={(event) => setWorkspaceName(event.target.value)}
							className="ot-input h-10 px-3 text-sm"
							placeholder="Acme Product"
						/>
					</div>
					<div className="space-y-2">
						<label htmlFor="workspace-desc-textarea" className="ot-label">
							Description
						</label>
						<textarea
							id="workspace-desc-textarea"
							value={workspaceDesc}
							onChange={(event) => setWorkspaceDesc(event.target.value)}
							className="ot-input h-24 resize-none px-3 py-2 text-sm"
							placeholder="What does this team collaborate on?"
						/>
					</div>
					<Button
						type="submit"
						variant="primary"
						className="w-full"
						disabled={createWorkspaceMutation.isPending}
					>
						{createWorkspaceMutation.isPending && (
							<Loader2 className="h-4 w-4 animate-spin" />
						)}
						Create workspace
					</Button>
				</form>
			</Dialog>

			<Dialog
				open={isProjectModalOpen}
				title="Create project"
				description={`Add a focused collaboration surface${activeWorkspace ? ` inside ${activeWorkspace.name}` : ""}.`}
				onClose={() => setIsProjectModalOpen(false)}
			>
				<form onSubmit={handleCreateProject} className="space-y-4 p-5">
					<div className="space-y-2">
						<label htmlFor="project-name-input" className="ot-label">
							Name
						</label>
						<input
							id="project-name-input"
							required
							value={projectName}
							onChange={(event) => setProjectName(event.target.value)}
							className="ot-input h-10 px-3 text-sm"
							placeholder="Launch plan"
						/>
					</div>
					<div className="space-y-2">
						<label htmlFor="project-desc-textarea" className="ot-label">
							Description
						</label>
						<textarea
							id="project-desc-textarea"
							value={projectDesc}
							onChange={(event) => setProjectDesc(event.target.value)}
							className="ot-input h-24 resize-none px-3 py-2 text-sm"
							placeholder="What work belongs here?"
						/>
					</div>
					<Button
						type="submit"
						variant="primary"
						className="w-full"
						disabled={createProjectMutation.isPending || !activeWorkspaceId}
					>
						{createProjectMutation.isPending && (
							<Loader2 className="h-4 w-4 animate-spin" />
						)}
						Create project
					</Button>
				</form>
			</Dialog>
		</aside>
	);
};
