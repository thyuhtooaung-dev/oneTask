import axios from "axios";
import { axiosClient } from "./axiosClient";

export interface UserProfile {
	id: string;
	email: string;
	name?: string;
}

export interface AuthResponse {
	user: UserProfile;
	accessToken: string;
}

/**
 * Sends a sign-in request to the NestJS backend
 */
export async function loginUser(
	email: string,
	password: string,
): Promise<AuthResponse> {
	try {
		const response = await axiosClient.post<AuthResponse>("/auth/login", {
			email,
			password,
		});
		return response.data;
	} catch (err) {
		if (axios.isAxiosError(err)) {
			const responseData = err.response?.data as
				| { message?: string }
				| undefined;
			throw new Error(responseData?.message || "Invalid email or password");
		}
		throw new Error("An unexpected error occurred. Please try again.");
	}
}

/**
 * Sends a registration request to the NestJS backend
 */
export async function registerUser(
	name: string,
	email: string,
	password: string,
): Promise<AuthResponse> {
	try {
		const response = await axiosClient.post<AuthResponse>("/auth/register", {
			name,
			email,
			password,
		});
		return response.data;
	} catch (err) {
		if (axios.isAxiosError(err)) {
			const responseData = err.response?.data as
				| { message?: string }
				| undefined;
			throw new Error(
				responseData?.message || "Registration failed. Please try again.",
			);
		}
		throw new Error("An unexpected error occurred. Please try again.");
	}
}
