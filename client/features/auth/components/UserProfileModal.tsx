import { useAuth } from "@/features/auth/hooks/useAuth";
import {
	useUpdatePassword,
	useUpdateProfile,
} from "@/features/auth/hooks/useUserData";
import { useUIStore } from "@/features/workspace/store/uiStore";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { Button } from "@/shared/ui/button/Button";
import { Dialog } from "@/shared/ui/dialog/Dialog";
import { Loader2, Lock, User as UserIcon } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useRef, useState } from "react";

export const UserProfileModal: React.FC = () => {
	const { user, refreshProfile } = useAuth();
	const { isUserProfileModalOpen, setUserProfileModalOpen } = useUIStore();

	const [activeTab, setActiveTab] = useState<"general" | "security">("general");

	const updateProfile = useUpdateProfile();
	const updatePassword = useUpdatePassword();

	const [name, setName] = useState("");
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [passwordError, setPasswordError] = useState("");
	const [passwordSuccess, setPasswordSuccess] = useState("");

	const [prevIsOpen, setPrevIsOpen] = useState(isUserProfileModalOpen);
	if (isUserProfileModalOpen && !prevIsOpen) {
		setPrevIsOpen(true);
		setName(user?.name || "");
		setAvatarUrl(user?.avatarUrl || null);
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setPasswordError("");
		setPasswordSuccess("");
		setActiveTab("general");
	} else if (!isUserProfileModalOpen && prevIsOpen) {
		setPrevIsOpen(false);
	}

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onloadend = () => {
			setAvatarUrl(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		await updateProfile.mutateAsync({
			name: name.trim() || undefined,
			avatarUrl: avatarUrl || undefined,
		});
		await refreshProfile();
		setUserProfileModalOpen(false);
	};

	const handleUpdatePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setPasswordError("");
		setPasswordSuccess("");

		if (newPassword !== confirmPassword) {
			setPasswordError("New passwords do not match");
			return;
		}

		if (newPassword.length < 6) {
			setPasswordError("Password must be at least 6 characters");
			return;
		}

		try {
			await updatePassword.mutateAsync({
				currentPassword,
				newPassword,
			});
			setPasswordSuccess("Password updated successfully");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } } };
			setPasswordError(
				err.response?.data?.message || "Failed to update password",
			);
		}
	};

	return (
		<Dialog
			open={isUserProfileModalOpen}
			title="Profile & Settings"
			description="Manage your account details and security preferences."
			onClose={() => setUserProfileModalOpen(false)}
		>
			<div className="flex border-b border-surface-900 px-5 pt-4">
				<button
					type="button"
					onClick={() => setActiveTab("general")}
					className={`flex items-center gap-2 border-b-2 pb-3 px-1 text-sm font-medium transition-colors ${
						activeTab === "general"
							? "border-primary-500 text-primary-200"
							: "border-transparent text-surface-500 hover:text-surface-300"
					}`}
				>
					<UserIcon className="h-4 w-4" />
					General
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("security")}
					className={`ml-6 flex items-center gap-2 border-b-2 pb-3 px-1 text-sm font-medium transition-colors ${
						activeTab === "security"
							? "border-primary-500 text-primary-200"
							: "border-transparent text-surface-500 hover:text-surface-300"
					}`}
				>
					<Lock className="h-4 w-4" />
					Security
				</button>
			</div>

			<div className="p-5">
				{activeTab === "general" ? (
					<form onSubmit={handleUpdateProfile} className="space-y-5">
						<div className="flex items-center gap-4">
							<div className="relative">
								{avatarUrl ? (
									<img
										src={avatarUrl}
										alt="Avatar preview"
										width={64}
										height={64}
										className="h-16 w-16 rounded-full object-cover border border-surface-800"
									/>
								) : (
									<Avatar name={user?.name} email={user?.email} size="lg" />
								)}
							</div>
							<div className="space-y-1">
								<p className="text-sm font-medium text-surface-200">
									Profile picture
								</p>
								<p className="text-xs text-surface-500">
									Supported formats: JPG, PNG, WebP
								</p>
								<div className="mt-2 flex items-center gap-2">
									<input
										type="file"
										accept="image/png, image/jpeg, image/webp"
										className="hidden"
										ref={fileInputRef}
										onChange={handleImageChange}
									/>
									<Button
										type="button"
										variant="secondary"
										onClick={() => fileInputRef.current?.click()}
									>
										Upload new
									</Button>
									{avatarUrl && (
										<Button
											type="button"
											variant="ghost"
											onClick={() => setAvatarUrl(null)}
										>
											Remove
										</Button>
									)}
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<label htmlFor="profile-email" className="ot-label">
								Email address
							</label>
							<input
								id="profile-email"
								type="email"
								value={user?.email || ""}
								disabled
								className="ot-input h-10 px-3 text-sm opacity-50 cursor-not-allowed"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="profile-name" className="ot-label">
								Display name
							</label>
							<input
								id="profile-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="ot-input h-10 px-3 text-sm"
								placeholder="Your name"
							/>
						</div>

						<div className="flex justify-end pt-2">
							<Button
								type="submit"
								variant="primary"
								disabled={updateProfile.isPending || (!name && !avatarUrl)}
							>
								{updateProfile.isPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Save changes
							</Button>
						</div>
					</form>
				) : (
					<form onSubmit={handleUpdatePassword} className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="current-password" className="ot-label">
								Current password
							</label>
							<input
								id="current-password"
								type="password"
								required
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								className="ot-input h-10 px-3 text-sm"
							/>
						</div>

						<div className="my-4 h-px bg-surface-900" />

						<div className="space-y-2">
							<label htmlFor="new-password" className="ot-label">
								New password
							</label>
							<input
								id="new-password"
								type="password"
								required
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="ot-input h-10 px-3 text-sm"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="confirm-password" className="ot-label">
								Confirm new password
							</label>
							<input
								id="confirm-password"
								type="password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="ot-input h-10 px-3 text-sm"
							/>
						</div>

						{passwordError && (
							<p className="text-sm font-medium text-danger-400">
								{passwordError}
							</p>
						)}
						{passwordSuccess && (
							<p className="text-sm font-medium text-success-400">
								{passwordSuccess}
							</p>
						)}

						<div className="flex justify-end pt-2">
							<Button
								type="submit"
								variant="primary"
								disabled={
									updatePassword.isPending ||
									!currentPassword ||
									!newPassword ||
									!confirmPassword
								}
							>
								{updatePassword.isPending && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								Update password
							</Button>
						</div>
					</form>
				)}
			</div>
		</Dialog>
	);
};
