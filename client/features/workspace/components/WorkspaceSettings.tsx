"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { Check, Copy, Loader2, Shield, Trash2, User, X } from "lucide-react";
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
import { useWorkspacePermissions } from "../hooks/useWorkspacePermissions";

function roleTone(role: string) {
	if (role === "owner") return "warning";
	if (role === "admin") return "accent";
	return "neutral";
}

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
			<div className="flex min-h-[50vh] items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-violet-400" />
			</div>
		);
	}

	if (!workspace) return null;

	const { canManageMembers, canInviteMembers, canManageWorkspace } =
		useWorkspacePermissions(workspaceId);

	const handleCreateInvite = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!inviteEmail.trim()) return;

		await createInviteMutation.mutateAsync({
			email: inviteEmail.trim(),
			role: inviteRole,
		});
		setInviteEmail("");
		setInviteRole("member");
	};

	const handleCopyLink = (token: string) => {
		const url = `${window.location.origin}/invite/${token}`;
		navigator.clipboard.writeText(url);
		setCopiedToken(token);
		setTimeout(() => setCopiedToken(null), 2000);
	};

	return (
		<div className="mx-auto max-w-5xl space-y-6 pb-12 animate-fade-in">
			<div className="rounded-2xl border border-zinc-900 bg-zinc-950/45 p-5">
				<p className="ot-label">Workspace system</p>
				<h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">
					Members & settings
				</h2>
				<p className="mt-1 text-sm leading-6 text-zinc-500">
					Manage access and pending invitations for{" "}
					<span className="font-medium text-zinc-300">{workspace.name}</span>.
				</p>
			</div>

			<section className="overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/45">
				<div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
					<div className="flex items-center gap-2">
						<User className="h-4 w-4 text-violet-300" />
						<h3 className="text-sm font-semibold text-zinc-100">Members</h3>
					</div>
					<Badge>{workspace.members.length} members</Badge>
				</div>

				<div className="divide-y divide-zinc-900">
					{workspace.members.map((member) => (
						<div
							key={member.id}
							className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-zinc-900/35"
						>
							<div className="flex min-w-0 items-center gap-3">
								<Avatar
									name={member.user.name}
									email={member.user.email}
									size="lg"
								/>
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<p className="truncate text-sm font-medium text-zinc-100">
											{member.user.name || "Anonymous User"}
										</p>
										{member.userId === user?.id && (
											<Badge tone="accent">You</Badge>
										)}
									</div>
									<p className="truncate text-xs text-zinc-500">
										{member.user.email}
									</p>
								</div>
							</div>

							<div className="flex shrink-0 items-center gap-3">
								{canManageWorkspace && member.userId !== user?.id ? (
									<select
										value={member.role}
										onChange={(event) =>
											updateRoleMutation.mutate({
												memberId: member.id,
												role: event.target.value,
											})
										}
										disabled={updateRoleMutation.isPending}
										className="ot-input h-8 w-28 px-2 text-xs"
									>
										<option value="owner" disabled>
											Owner
										</option>
										<option value="admin">Admin</option>
										<option value="member">Member</option>
									</select>
								) : (
									<Badge tone={roleTone(member.role)}>{member.role}</Badge>
								)}

								{canManageMembers &&
									member.userId !== user?.id &&
									member.role !== "owner" &&
									!(member.role === "admin" && !canManageWorkspace) && (
										<Button
											variant="ghost"
											size="icon"
											onClick={() => removeMemberMutation.mutate(member.id)}
											disabled={removeMemberMutation.isPending}
											title="Remove member"
										>
											<Trash2 className="h-4 w-4 text-red-300" />
										</Button>
									)}
							</div>
						</div>
					))}
				</div>
			</section>

			{canInviteMembers && (
				<section className="overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950/45">
					<div className="border-b border-zinc-900 px-5 py-4">
						<div className="mb-4 flex items-center gap-2">
							<Shield className="h-4 w-4 text-violet-300" />
							<h3 className="text-sm font-semibold text-zinc-100">
								Pending invites
							</h3>
						</div>

						<form
							onSubmit={handleCreateInvite}
							className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_auto]"
						>
							<input
								type="email"
								required
								placeholder="Email address"
								value={inviteEmail}
								onChange={(event) => setInviteEmail(event.target.value)}
								className="ot-input h-10 px-3 text-sm"
							/>
							<select
								value={inviteRole}
								onChange={(event) => setInviteRole(event.target.value)}
								className="ot-input h-10 px-3 text-sm"
							>
								<option value="member">Member</option>
								{canManageWorkspace && <option value="admin">Admin</option>}
							</select>
							<Button
								type="submit"
								variant="primary"
								disabled={createInviteMutation.isPending}
							>
								{createInviteMutation.isPending && (
									<Loader2 className="h-4 w-4 animate-spin" />
								)}
								Send invite
							</Button>
						</form>
					</div>

					<div className="divide-y divide-zinc-900">
						{isLoadingInvites ? (
							<div className="flex justify-center p-8">
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
									className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-zinc-900/35"
								>
									<div className="min-w-0">
										<p className="truncate text-sm font-medium text-zinc-100">
											{invite.email}
										</p>
										<div className="mt-1 flex items-center gap-2">
											<Badge>{invite.role}</Badge>
											<span className="text-[10px] font-medium text-zinc-600">
												Expires{" "}
												{new Date(invite.expiresAt).toLocaleDateString()}
											</span>
										</div>
									</div>
									<div className="flex shrink-0 items-center gap-2">
										<Button
											variant="secondary"
											size="sm"
											onClick={() => handleCopyLink(invite.token)}
										>
											{copiedToken === invite.token ? (
												<Check className="h-3.5 w-3.5 text-emerald-300" />
											) : (
												<Copy className="h-3.5 w-3.5" />
											)}
											{copiedToken === invite.token ? "Copied" : "Copy link"}
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => revokeInviteMutation.mutate(invite.id)}
											disabled={revokeInviteMutation.isPending}
											title="Revoke invite"
										>
											<X className="h-4 w-4 text-red-300" />
										</Button>
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
