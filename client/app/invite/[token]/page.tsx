"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import {
	useAcceptInvite,
	useGetInviteMetadata,
} from "@/features/workspace/hooks/useWorkspaceData";
import { useUIStore } from "@/features/workspace/store/uiStore";
import { Loader2, ShieldAlert, Sparkles, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function InvitePage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = use(params);
	const router = useRouter();
	const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
	const { setActiveWorkspaceId } = useUIStore();

	const {
		data: invite,
		isLoading: isInviteLoading,
		error: inviteError,
	} = useGetInviteMetadata(token);
	const acceptInviteMutation = useAcceptInvite();

	if (isAuthLoading || isInviteLoading) {
		return (
			<div className="min-h-screen bg-linear-to-br from-surface-950 via-surface-900 to-black flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary-500" />
			</div>
		);
	}

	if (inviteError || !invite) {
		return (
			<div className="min-h-screen bg-linear-to-br from-surface-950 via-surface-900 to-black flex flex-col items-center justify-center p-4">
				<div className="bg-surface-900/50 border border-surface-800 rounded-2xl p-8 max-w-md w-full text-center backdrop-blur-xl">
					<ShieldAlert className="h-12 w-12 text-danger-400 mx-auto mb-4" />
					<h2 className="text-xl font-bold text-white mb-2">
						Invalid or Expired Invite
					</h2>
					<p className="text-surface-400 text-sm mb-6">
						This invitation link is no longer valid. Please ask the workspace
						administrator to send you a new one.
					</p>
					<button
						type="button"
						onClick={() => router.push("/")}
						className="w-full bg-surface-800 hover:bg-surface-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
					>
						Go to Dashboard
					</button>
				</div>
			</div>
		);
	}

	const handleAccept = async () => {
		try {
			const result = await acceptInviteMutation.mutateAsync(token);
			setActiveWorkspaceId(result.workspaceId);
			router.push("/");
		} catch (err) {
			console.error("Failed to accept invite", err);
			alert(
				"Failed to accept invite. Make sure you are using the correct email address.",
			);
		}
	};

	const handleLoginRedirect = () => {
		localStorage.setItem("onetask_invite_token", token);
		router.push("/auth/login");
	};

	const handleRegisterRedirect = () => {
		localStorage.setItem("onetask_invite_token", token);
		router.push("/auth/register");
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-surface-950 via-surface-900 to-black flex flex-col items-center justify-center p-4">
			<div className="bg-surface-900/50 border border-surface-800 rounded-3xl p-8 max-w-md w-full text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
				{/* Decorative elements */}
				<div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary-500 via-primary-500 to-pink-500" />
				<div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />

				<div className="h-16 w-16 bg-linear-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/20">
					<Sparkles className="h-8 w-8 text-white" />
				</div>

				<h2 className="text-2xl font-bold text-white mb-2">
					You&apos;ve been invited!
				</h2>
				<p className="text-surface-400 text-sm mb-8">
					{invite.creatorName ? (
						<strong className="text-surface-300">{invite.creatorName}</strong>
					) : (
						"Someone"
					)}{" "}
					has invited you to join{" "}
					<strong className="text-surface-200">{invite.workspaceName}</strong>{" "}
					as a{" "}
					<strong className="text-primary-400 uppercase tracking-wider text-[10px] bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 rounded">
						{invite.role}
					</strong>
					.
				</p>

				{isAuthenticated ? (
					<div className="space-y-4">
						<div className="bg-surface-950/50 border border-surface-800/80 rounded-xl p-4 flex items-center gap-3 text-left">
							<div className="h-10 w-10 bg-surface-800 rounded-full flex items-center justify-center text-primary-400 font-bold uppercase shrink-0">
								{user?.name?.[0] || user?.email?.[0]}
							</div>
							<div className="min-w-0">
								<p className="text-sm font-semibold text-white truncate">
									{user?.name}
								</p>
								<p className="text-xs text-surface-500 truncate">
									{user?.email}
								</p>
							</div>
						</div>

						{user?.email !== invite.email ? (
							<div className="bg-danger-500/10 border border-danger-500/20 rounded-xl p-4 text-left">
								<p className="text-xs text-danger-400 mb-1 font-bold">
									Email Mismatch
								</p>
								<p className="text-xs text-danger-300/80">
									This invite was sent to <strong>{invite.email}</strong>, but
									you are logged in as <strong>{user?.email}</strong>. Please
									log in with the correct account to accept.
								</p>
								<button
									type="button"
									onClick={handleLoginRedirect}
									className="mt-3 text-xs text-danger-400 hover:text-danger-300 underline font-medium"
								>
									Switch account
								</button>
							</div>
						) : (
							<button
								type="button"
								onClick={handleAccept}
								disabled={acceptInviteMutation.isPending}
								className="w-full bg-linear-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
							>
								{acceptInviteMutation.isPending ? (
									<Loader2 className="h-5 w-5 animate-spin" />
								) : (
									<>
										<UserPlus className="h-5 w-5" />
										Accept Invitation
									</>
								)}
							</button>
						)}
					</div>
				) : (
					<div className="space-y-3">
						<div className="bg-surface-950/50 border border-surface-800/80 rounded-xl p-4 mb-4 text-left">
							<p className="text-xs text-surface-400">
								This invite was sent to{" "}
								<strong className="text-surface-200">{invite.email}</strong>.
								Please sign in or create an account with this email to join.
							</p>
						</div>
						<button
							type="button"
							onClick={handleRegisterRedirect}
							className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
						>
							Create Account
						</button>
						<button
							type="button"
							onClick={handleLoginRedirect}
							className="w-full bg-surface-800 hover:bg-surface-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
						>
							Log In
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
