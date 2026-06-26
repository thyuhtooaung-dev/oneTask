"use client";

import { useUIStore } from "@/features/workspace/store/uiStore";
import { Button } from "@/shared/ui/button/Button";
import { DropdownMenu } from "@/shared/ui/dropdown-menu/DropdownMenu";
import { Bell, Check, Loader2 } from "lucide-react";
import {
	type Notification as AppNotification,
	useMarkAllNotificationsAsRead,
	useMarkNotificationAsRead,
	useNotifications,
} from "../hooks/useNotifications";

export function NotificationBell() {
	const { data: notifications = [], isLoading } = useNotifications();
	const markAsRead = useMarkNotificationAsRead();
	const markAllAsRead = useMarkAllNotificationsAsRead();
	const { isNotificationsOpen, openTaskModal, setNotificationsOpen } =
		useUIStore();

	const unreadCount = notifications.filter((n) => !n.read).length;

	const handleNotificationClick = (notification: AppNotification) => {
		if (!notification.read) {
			markAsRead.mutate(notification.id);
		}

		if (
			(notification.type === "task.assigned" ||
				notification.type === "task.commented" ||
				notification.type === "comment.mentioned" ||
				notification.type === "task.status_changed") &&
			notification.payload?.taskId
		) {
			openTaskModal(notification.payload.taskId as string);
		}
	};

	return (
		<DropdownMenu.Root
			open={isNotificationsOpen}
			onOpenChange={setNotificationsOpen}
		>
			<DropdownMenu.Trigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative group hover:bg-surface-900/70 text-surface-400 hover:text-surface-100 transition-colors"
				>
					<Bell className="h-4 w-4" />
					{unreadCount > 0 && (
						<span className="absolute top-1.5 right-1.5 flex h-2 w-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
							<span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
						</span>
					)}
				</Button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					align="end"
					sideOffset={8}
					className="z-50 w-80 rounded-xl border border-surface-800 bg-surface-950 p-1 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-top-2"
				>
					<div className="flex items-center justify-between px-3 py-2 border-b border-surface-900 mb-1">
						<span className="text-sm font-semibold text-surface-100">
							Notifications
						</span>
						{unreadCount > 0 && (
							<Button
								variant="ghost"
								className="text-[10px] h-6 px-2 text-surface-400 hover:text-primary-300 transition-colors"
								onClick={(e) => {
									e.preventDefault();
									markAllAsRead.mutate();
								}}
								disabled={markAllAsRead.isPending}
							>
								<Check className="h-3 w-3 mr-1" />
								Mark all read
							</Button>
						)}
					</div>

					<div className="max-h-[60vh] overflow-y-auto">
						{isLoading ? (
							<div className="flex items-center justify-center py-6 text-surface-500">
								<Loader2 className="h-4 w-4 animate-spin" />
							</div>
						) : notifications.length === 0 ? (
							<div className="px-4 py-8 text-center text-sm text-surface-500">
								<Bell className="h-6 w-6 mx-auto mb-2 opacity-20" />
								No notifications yet
							</div>
						) : (
							notifications.map((notification) => (
								<DropdownMenu.Item
									key={notification.id}
									onSelect={() => handleNotificationClick(notification)}
									className="flex cursor-pointer flex-col gap-1 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors hover:bg-surface-900 focus:bg-surface-900"
								>
									<div className="flex items-start justify-between gap-2">
										<p
											className={`text-xs ${notification.read ? "text-surface-400" : "font-medium text-surface-100"}`}
										>
											{notification.type === "task.assigned" ? (
												<>
													You were assigned to{" "}
													<span className="font-semibold text-primary-300">
														{(notification.payload?.taskTitle as string) ||
															"a task"}
													</span>
												</>
											) : notification.type === "task.commented" ? (
												<>
													New comment on{" "}
													<span className="font-semibold text-primary-300">
														{(notification.payload?.taskTitle as string) ||
															"your task"}
													</span>
												</>
											) : notification.type === "comment.mentioned" ? (
												<>
													You were mentioned on{" "}
													<span className="font-semibold text-primary-300">
														{(notification.payload?.taskTitle as string) ||
															"a task"}
													</span>
												</>
											) : notification.type === "task.status_changed" ? (
												<>
													Status of{" "}
													<span className="font-semibold text-primary-300">
														{(notification.payload?.taskTitle as string) ||
															"your task"}
													</span>{" "}
													changed to{" "}
													<span className="font-semibold text-primary-300 capitalize">
														{String(
															notification.payload?.status || "unknown",
														).replace("_", " ")}
													</span>
												</>
											) : (
												"New notification"
											)}
										</p>
										{!notification.read && (
											<span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
										)}
									</div>
									<span className="text-[10px] text-surface-600">
										{new Date(notification.createdAt).toLocaleDateString()}
									</span>
								</DropdownMenu.Item>
							))
						)}
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
