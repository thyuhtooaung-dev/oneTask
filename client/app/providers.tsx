"use client";

import { AuthProvider } from "@/features/auth/context/AuthContext";
import { SocketProvider } from "@/features/realtime/context/SocketContext";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import type React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<SocketProvider>{children}</SocketProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}
