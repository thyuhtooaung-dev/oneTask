"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { AlertCircle, Loader2, Lock, Mail, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

export default function RegisterPage() {
	const router = useRouter();
	const { register } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			await register({ name, email, password });

			// Check if there is a pending invite token
			const inviteToken = localStorage.getItem("onetask_invite_token");
			if (inviteToken) {
				localStorage.removeItem("onetask_invite_token");
				router.push(`/invite/${inviteToken}`);
			} else {
				// Redirect to home dashboard
				router.push("/");
			}
		} catch (err) {
			const message =
				err instanceof Error
					? err.message
					: "An unexpected error occurred. Please try again.";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative flex min-h-dvh items-start justify-center overflow-y-auto bg-background px-3 py-6 font-sans sm:items-center sm:px-4">
			<div className="relative z-10 w-full max-w-md rounded-2xl border border-border/40 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:p-8">
				{/* Header / Brand */}
				<div className="flex flex-col items-center mb-8">
					<div className="relative w-16 h-16 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-primary/20 overflow-hidden">
						<Image
							src="/logo.jpg"
							alt="oneTask Logo"
							fill
							className="object-cover"
						/>
					</div>
					<h1 className="text-2xl font-bold text-foreground tracking-tight">
						Create Account
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Get started with oneTask today
					</p>
				</div>

				{/* Error Alert Display */}
				{error && (
					<div className="mb-6 p-4 bg-destructive/15 border border-destructive/30 rounded-xl flex items-start gap-3 animate-pulse">
						<AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
						<div className="text-sm font-medium text-destructive-foreground">
							{error}
						</div>
					</div>
				)}

				{/* Registration Form */}
				<form onSubmit={handleSubmit} className="space-y-5">
					{/* Full Name field */}
					<div className="space-y-2">
						<label
							htmlFor="name-input"
							className="text-xs font-semibold text-foreground uppercase tracking-wider"
						>
							Full Name
						</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
								<User className="w-5 h-5" />
							</span>
							<input
								id="name-input"
								type="text"
								autoComplete="name"
								required
								disabled={isLoading}
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Alex Mercer"
								className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm text-foreground disabled:opacity-50"
							/>
						</div>
					</div>

					{/* Email field */}
					<div className="space-y-2">
						<label
							htmlFor="email-input"
							className="text-xs font-semibold text-foreground uppercase tracking-wider"
						>
							Email Address
						</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
								<Mail className="w-5 h-5" />
							</span>
							<input
								id="email-input"
								type="email"
								autoComplete="email"
								inputMode="email"
								required
								disabled={isLoading}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm text-foreground disabled:opacity-50"
							/>
						</div>
					</div>

					{/* Password field */}
					<div className="space-y-2">
						<label
							htmlFor="password-input"
							className="text-xs font-semibold text-foreground uppercase tracking-wider"
						>
							Password
						</label>
						<div className="relative">
							<span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
								<Lock className="w-5 h-5" />
							</span>
							<input
								id="password-input"
								type="password"
								autoComplete="new-password"
								required
								disabled={isLoading}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm text-foreground disabled:opacity-50"
							/>
						</div>
					</div>

					{/* Submit button */}
					<button
						type="submit"
						disabled={isLoading}
						className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? (
							<>
								<Loader2 className="animate-spin h-5 w-5 text-current" />
								<span>Creating account...</span>
							</>
						) : (
							<span>Create Account</span>
						)}
					</button>
				</form>

				{/* Footer Navigation */}
				<div className="mt-8 pt-6 border-t border-border/40 text-center text-sm">
					<span className="text-muted-foreground">
						Already have an account?{" "}
					</span>
					<Link
						href="/auth/login"
						className="font-semibold text-primary hover:text-primary/80 transition-colors"
					>
						Sign in
					</Link>
				</div>
			</div>
		</div>
	);
}
