import { axiosClient } from "@/lib/api/axiosClient";
import { useMutation } from "@tanstack/react-query";
import type { UserProfile } from "../context/AuthContext";

export function useUpdateProfile() {
	return useMutation({
		mutationFn: async (data: { name?: string; avatarUrl?: string }) => {
			const response = await axiosClient.patch<UserProfile>("/users/me", data);
			return response.data;
		},
	});
}

export function useUpdatePassword() {
	return useMutation({
		mutationFn: async (data: {
			currentPassword?: string;
			newPassword?: string;
		}) => {
			const response = await axiosClient.patch<{ message: string }>(
				"/users/me/password",
				data,
			);
			return response.data;
		},
	});
}
