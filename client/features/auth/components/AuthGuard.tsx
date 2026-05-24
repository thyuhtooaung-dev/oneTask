"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/auth/login");
		}
	}, [isLoading, isAuthenticated, router]);

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-slate-900 via-zinc-900 to-black text-white gap-4">
				<Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
				<span className="text-zinc-400 font-medium tracking-wide animate-pulse">
					Hydrating collaboration context...
				</span>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null; // Prevent flashes of protected content before redirecting
	}

	return <>{children}</>;
};
