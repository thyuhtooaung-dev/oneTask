"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import {
	Check,
	Copy,
	Link as LinkIcon,
	Loader2,
	Shield,
	Trash2,
	User,
	X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
	useCreateInvite,
	useRemoveMember,
	useRevokeInvite,
	useUpdateMemberRole,
	useWorkspaceDetail,
	useWorkspaceInvites,
} from "../hooks/useWorkspaceData";

export const WorkspaceSettings: React.FC<{ workspaceId: string }> = ({
	workspaceId,
}) => {
	const { user } = useAuth();
	const { data: workspace, isLoading: isLoadingWorkspace } =
		useWorkspaceDetail(workspaceId);
	const { data: invites = [], isLoading: isLoadingInvites } =
		useWorkspaceInvites(workspaceId);

	const createInviteMutation = useCreateInvite(workspaceId);
	const revokeInviteMutation = useRevokeInvite(workspaceId);
	const updateRoleMutation = useUpdateMemberRole(workspaceId);
	const removeMemberMutation = useRemoveMember(workspaceId);

	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState("member");
	const [copiedToken, setCopiedToken] = useState<string | null>(null);

	if (isLoadingWorkspace) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
			</div>
		);
	}

	if (!workspace) return null;

	const currentUserMember = workspace.members.find(
		(m) => m.userId === user?.id,
	);
	const isOwner = currentUserMember?.role === "owner";
	const isAdmin = currentUserMember?.role === "admin" || isOwner;

	const handleCreateInvite = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inviteEmail) return;
		try {
			await createInviteMutation.mutateAsync({
				email: inviteEmail,
				role: inviteRole,
			});
			setInviteEmail("");
			setInviteRole("member");
		} catch (err) {
			console.error("Failed to create invite", err);
		}
	};

	const handleCopyLink = (token: string) => {
		const url = `${window.location.origin}/invite/${token}`;
		navigator.clipboard.writeText(url);
		setCopiedToken(token);
		setTimeout(() => setCopiedToken(null), 2000);
	};

	return (
		<div className="space-y-8 max-w-4xl mx-auto animate-fade-in pb-12">
			<div>
				<h2 className="text-2xl font-bold text-white mb-2">
					Workspace Settings
				</h2>
				<p className="text-zinc-400 text-sm">
					Manage members, roles, and pending invitations for{" "}
					<strong>{workspace.name}</strong>.
				</p>
			</div>

			{/* Members Section */}
			<section className="bg-zinc-950/40 border border-zinc-900/60 rounded-2xl overflow-hidden backdrop-blur-md">
				<div className="p-5 border-b border-zinc-900/60 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<User className="h-5 w-5 text-indigo-400" />
						<h3 className="font-semibold text-white">Members</h3>
					</div>
					<span className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-full">
						{workspace.members.length} members
					</span>
				</div>

				<div className="divide-y divide-zinc-900/50">
					{workspace.members.map((member) => (
						<div
							key={member.id}
							className="p-4 flex items-center justify-between hover:bg-zinc-900/20 transition-colors"
						>
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 text-indigo-400 font-bold uppercase">
									{member.user.name
										? member.user.name[0]
										: member.user.email[0]}
								</div>
								<div>
									<div className="flex items-center gap-2">
										<p className="text-sm font-medium text-white">
											{member.user.name || "Anonymous User"}
										</p>
										{member.userId === user?.id && (
											<span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
												You
											</span>
										)}
									</div>
									<p className="text-xs text-zinc-500">{member.user.email}</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								{isOwner && member.userId !== user?.id ? (
									<select
										value={member.role}
										onChange={(e) =>
											updateRoleMutation.mutate({
												memberId: member.id,
												role: e.target.value,
											})
										}
										disabled={updateRoleMutation.isPending}
										className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-indigo-500/50 outline-none"
									>
										<option value="owner" disabled>
											Owner
										</option>
										<option value="admin">Admin</option>
										<option value="member">Member</option>
									</select>
								) : (
									<span
										className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg border ${
											member.role === "owner"
												? "bg-amber-500/10 text-amber-400 border-amber-500/20"
												: member.role === "admin"
													? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
													: "bg-zinc-800/50 text-zinc-400 border-zinc-700/50"
										}`}
									>
										{member.role}
									</span>
								)}

								{isAdmin &&
									member.userId !== user?.id &&
									member.role !== "owner" &&
									!(member.role === "admin" && !isOwner) && (
										<button
											type="button"
											onClick={() => removeMemberMutation.mutate(member.id)}
											disabled={removeMemberMutation.isPending}
											className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
											title="Remove member"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									)}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Invites Section */}
			{isAdmin && (
				<section className="bg-zinc-950/40 border border-zinc-900/60 rounded-2xl overflow-hidden backdrop-blur-md">
					<div className="p-5 border-b border-zinc-900/60">
						<div className="flex items-center gap-2 mb-4">
							<Shield className="h-5 w-5 text-indigo-400" />
							<h3 className="font-semibold text-white">Pending Invites</h3>
						</div>

						<form onSubmit={handleCreateInvite} className="flex gap-3">
							<input
								type="email"
								required
								placeholder="Email address"
								value={inviteEmail}
								onChange={(e) => setInviteEmail(e.target.value)}
								className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-indigo-500/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
							/>
							<select
								value={inviteRole}
								onChange={(e) => setInviteRole(e.target.value)}
								className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
							>
								<option value="member">Member</option>
								{isOwner && <option value="admin">Admin</option>}
							</select>
							<button
								type="submit"
								disabled={createInviteMutation.isPending}
								className="bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
							>
								{createInviteMutation.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									"Send Invite"
								)}
							</button>
						</form>
					</div>

					<div className="divide-y divide-zinc-900/50">
						{isLoadingInvites ? (
							<div className="p-8 flex justify-center">
								<Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
							</div>
						) : invites.length === 0 ? (
							<div className="p-8 text-center text-sm text-zinc-500">
								No pending invites.
							</div>
						) : (
							invites.map((invite) => (
								<div
									key={invite.id}
									className="p-4 flex items-center justify-between hover:bg-zinc-900/20 transition-colors"
								>
									<div>
										<p className="text-sm font-medium text-white">
											{invite.email}
										</p>
										<div className="flex items-center gap-2 mt-1">
											<span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700">
												{invite.role}
											</span>
											<span className="text-[10px] text-zinc-500">
												Expires{" "}
												{new Date(invite.expiresAt).toLocaleDateString()}
											</span>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() => handleCopyLink(invite.token)}
											className="flex items-center gap-1.5 px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition-colors"
										>
											{copiedToken === invite.token ? (
												<Check className="h-3.5 w-3.5 text-emerald-400" />
											) : (
												<Copy className="h-3.5 w-3.5" />
											)}
											{copiedToken === invite.token ? "Copied" : "Copy Link"}
										</button>
										<button
											type="button"
											onClick={() => revokeInviteMutation.mutate(invite.id)}
											disabled={revokeInviteMutation.isPending}
											className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
											title="Revoke invite"
										>
											<X className="h-4 w-4" />
										</button>
									</div>
								</div>
							))
						)}
					</div>
				</section>
			)}
		</div>
	);
};
