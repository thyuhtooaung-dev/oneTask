"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import type { ActivityEvent } from "@/features/workspace/hooks/useActivityData";
import { useUIStore } from "@/features/workspace/store/uiStore";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useEffect, useMemo, useState } from "react";
import { type Socket, io } from "socket.io-client";

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType>({
	socket: null,
	isConnected: false,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { isAuthenticated, user } = useAuth();
	const { activeWorkspaceId } = useUIStore();
	const queryClient = useQueryClient();
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (!isAuthenticated || !user) {
			setSocket((currentSocket) => {
				currentSocket?.disconnect();
				return null;
			});
			setIsConnected(false);
			return;
		}

		const token =
			typeof window !== "undefined"
				? localStorage.getItem("onetask_token")
				: null;
		if (!token) return;

		const nextSocket = io(API_URL, {
			auth: { token },
			extraHeaders: {
				Authorization: `Bearer ${token}`,
			},
			query: { token },
			transports: ["websocket", "polling"],
		});

		nextSocket.on("connect", () => setIsConnected(true));
		nextSocket.on("disconnect", () => setIsConnected(false));
		nextSocket.on("activity_logged", (event: ActivityEvent) => {
			const workspaceId = event.workspaceId;
			queryClient.invalidateQueries({
				queryKey: ["workspaces", workspaceId, "activities"],
			});

			if (event.type.startsWith("task.")) {
				queryClient.invalidateQueries({
					queryKey: ["workspaces", workspaceId, "tasks"],
				});
			}

			if (event.type === "project.created") {
				queryClient.invalidateQueries({
					queryKey: ["workspaces", workspaceId, "projects"],
				});
			}

			if (event.type === "comment.created") {
				const taskId = event.metadata?.taskId;
				if (typeof taskId === "string") {
					queryClient.invalidateQueries({
						queryKey: ["tasks", taskId, "comments"],
					});
				}
			}
		});

		setSocket(nextSocket);

		return () => {
			nextSocket.disconnect();
			setSocket(null);
			setIsConnected(false);
		};
	}, [isAuthenticated, queryClient, user]);

	useEffect(() => {
		if (!socket || !activeWorkspaceId) return;

		socket.emit("joinWorkspace", { workspaceId: activeWorkspaceId });

		return () => {
			socket.emit("leaveWorkspace", { workspaceId: activeWorkspaceId });
		};
	}, [activeWorkspaceId, socket]);

	const value = useMemo(
		() => ({
			socket,
			isConnected,
		}),
		[socket, isConnected],
	);

	return (
		<SocketContext.Provider value={value}>{children}</SocketContext.Provider>
	);
};
