"use client";

import { loginUser, registerUser } from "@/lib/api/auth";
import { axiosClient } from "@/lib/api/axiosClient";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useCallback, useEffect, useState } from "react";

export interface UserProfile {
	id: string;
	email: string;
	name?: string;
	avatarUrl?: string;
}

export interface LoginCredentials {
	email: string;
	password?: string;
}

export interface RegisterCredentials {
	name?: string;
	email: string;
	password?: string;
}

interface AuthContextType {
	user: UserProfile | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (credentials: LoginCredentials) => Promise<void>;
	register: (credentials: RegisterCredentials) => Promise<void>;
	logout: () => void;
	refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const refreshProfile = useCallback(async () => {
		try {
			setIsLoading(true);
			const response = await axiosClient.get<UserProfile>("/auth/profile");
			setUser(response.data);
		} catch (error) {
			console.error("Failed to fetch user profile:", error);
			localStorage.removeItem("onetask_token");
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Hydrate user profile on component mount
	useEffect(() => {
		const hydrate = async () => {
			const token =
				typeof window !== "undefined"
					? localStorage.getItem("onetask_token")
					: null;
			if (!token) {
				// Yield execution to the next tick to ensure no synchronous setState happens inside the effect
				await new Promise((resolve) => setTimeout(resolve, 0));
				setUser(null);
				setIsLoading(false);
				return;
			}
			await refreshProfile();
		};

		hydrate();
	}, [refreshProfile]);

	const login = useCallback(
		async (credentials: LoginCredentials) => {
			const response = await loginUser(
				credentials.email,
				credentials.password || "",
			);
			localStorage.setItem("onetask_token", response.accessToken);
			await refreshProfile();
		},
		[refreshProfile],
	);

	const register = useCallback(
		async (credentials: RegisterCredentials) => {
			const response = await registerUser(
				credentials.name || "",
				credentials.email,
				credentials.password || "",
			);
			localStorage.setItem("onetask_token", response.accessToken);
			await refreshProfile();
		},
		[refreshProfile],
	);

	const queryClient = useQueryClient();
	const logout = useCallback(() => {
		localStorage.removeItem("onetask_token");
		queryClient.clear();
		setUser(null);
	}, [queryClient]);

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				isLoading,
				login,
				register,
				logout,
				refreshProfile,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
