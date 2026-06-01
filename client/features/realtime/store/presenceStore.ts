import { create } from "zustand";

interface PresenceStore {
	onlineUserIds: Set<string>;
	setOnlineUsers: (userIds: string[]) => void;
	clearPresence: () => void;
}

export const usePresenceStore = create<PresenceStore>((set) => ({
	onlineUserIds: new Set(),
	setOnlineUsers: (userIds) => set({ onlineUserIds: new Set(userIds) }),
	clearPresence: () => set({ onlineUserIds: new Set() }),
}));
