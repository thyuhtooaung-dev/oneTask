"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import type { ActivityEvent } from "@/features/workspace/hooks/useActivityData";
import { useUIStore } from "@/features/workspace/store/uiStore";
import { queryKeys } from "@/lib/queryKeys";
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

		const processedEvents = new Set<string>();

		nextSocket.on("connect", () => {
			setIsConnected(true);
			// On reconnect, refetch current workspace data to recover missed events
			const currentWorkspaceId = useUIStore.getState().activeWorkspaceId;
			if (currentWorkspaceId) {
				nextSocket.emit("joinWorkspace", { workspaceId: currentWorkspaceId });
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.tasks(currentWorkspaceId),
				});
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.projects(currentWorkspaceId),
				});
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.activities(currentWorkspaceId),
				});
			}
		});
		nextSocket.on("disconnect", () => setIsConnected(false));
		nextSocket.on("activity_logged", (event: ActivityEvent) => {
			if (event.id && processedEvents.has(event.id)) {
				return;
			}
			if (event.id) {
				processedEvents.add(event.id);
				if (processedEvents.size > 50) {
					const first = processedEvents.values().next().value;
					if (first) processedEvents.delete(first);
				}
			}

			const workspaceId = event.workspaceId;
			queryClient.invalidateQueries({
				queryKey: queryKeys.workspaces.activities(workspaceId),
			});

			if (event.type.startsWith("task.")) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.tasks(workspaceId),
				});
			}

			if (event.type === "project.created") {
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.projects(workspaceId),
				});
			}

			if (event.type === "comment.created") {
				const taskId = event.metadata?.taskId;
				if (typeof taskId === "string") {
					queryClient.invalidateQueries({
						queryKey: queryKeys.tasks.comments(taskId),
					});
				}
			}

			if (
				event.type === "member.left" ||
				event.type === "member.updated" ||
				event.type === "member.joined"
			) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.workspaces.detail(workspaceId),
				});
			}
		});

		// Handle being removed from a workspace
		nextSocket.on("workspace_removed", (data: { workspaceId: string }) => {
			const currentWorkspaceId = useUIStore.getState().activeWorkspaceId;
			if (currentWorkspaceId === data.workspaceId) {
				useUIStore.getState().setActiveWorkspaceId(null);
			}
			queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all() });
		});

		let active = true;
		queueMicrotask(() => {
			if (active) {
				setSocket(nextSocket);
			}
		});

		return () => {
			active = false;
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
