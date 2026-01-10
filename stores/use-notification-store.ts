/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import {
  NotificationMessage,
  WebSocketMessage,
  EventTypes,
} from "@/types/notification";
import { notificationService } from "@/services/notification-service";
import { getValidToken } from "@/lib/axios";

// get socket url helper
const getWebSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const protocol = apiUrl.startsWith("https") ? "wss://" : "ws://";
  const domain = apiUrl.replace(/^https?:\/\//, "");
  return `${protocol}${domain}/ws/hub`;
};

interface NotificationState {
  notifications: NotificationMessage[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  nextCursor: string | undefined;
  isConnected: boolean;

  // actions API
  fetchInitialData: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;

  // actions Socket
  connectSocket: () => void;
  disconnectSocket: () => void;
  receiveSocketMessage: (msg: NotificationMessage) => void;
}

let socket: WebSocket | null = null;
let pingInterval: NodeJS.Timeout;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: true,
  nextCursor: undefined,
  isConnected: false,

  // 1. receive Socket Message -> merge into store
  receiveSocketMessage: (newMsg) => {
    set((state) => {
      const currentList = Array.isArray(state.notifications)
        ? state.notifications
        : [];
      // avoid duplicate
      if (currentList.find((n) => n.id === newMsg.id)) return state;

      return {
        notifications: [newMsg, ...currentList],
        unreadCount: state.unreadCount + 1,
      };
    });
  },

  // 2. fetch API Initial (handle wrapper data)
  fetchInitialData: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });

    try {
      const [listRes, countRes] = await Promise.all([
        notificationService.getList(10),
        notificationService.getUnreadCount(),
      ]);

      // parse List
      const rawData = (listRes as any).data || listRes;

      // make sure data is array
      const apiList = Array.isArray(rawData) ? rawData : [];
      const cursor =
        (listRes as any).nextCursor || (listRes as any).meta?.next_cursor;

      // Parse Count
      const safeCount =
        typeof countRes === "number"
          ? countRes
          : (countRes as any).count ?? (countRes as any).data ?? 0;

      set((state) => {
        const currentNotis = Array.isArray(state.notifications)
          ? state.notifications
          : [];
        const combined = [...currentNotis, ...apiList];

        // remove duplicate
        const uniqueList = combined.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );

        // sort by createdAt
        uniqueList.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
          notifications: uniqueList,
          unreadCount: safeCount,
          nextCursor: cursor ?? undefined,
          hasMore: !!cursor,
        };
      });
    } catch (error) {
      console.error("Fetch init error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 3. load more
  loadMore: async () => {
    const { isLoading, hasMore, nextCursor, notifications } = get();
    if (isLoading || !hasMore || !nextCursor) return;

    set({ isLoading: true });
    try {
      const res = await notificationService.getList(10, nextCursor);

      const rawList = (res as any).data || res;
      const newList = Array.isArray(rawList) ? rawList : [];
      const newCursor = (res as any).nextCursor;

      set({
        notifications: [...notifications, ...newList],
        nextCursor: newCursor ?? undefined,
        hasMore: !!newCursor,
      });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  // 4. mark read
  markRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: 1 } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    await notificationService.markAsRead(id);
  },

  markAllRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: 1 })),
      unreadCount: 0,
    }));
    await notificationService.markAllRead();
  },

  // 5. connect Socket
  connectSocket: async () => {
    if (
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING)
    )
      return;

    const token = await getValidToken();
    if (!token) return;

    const wsUrl = getWebSocketUrl();
    socket = new WebSocket(`${wsUrl}?token=${token}`);

    socket.onopen = () => {
      console.log("🟢 WS Connected");
      set({ isConnected: true });
    };

    socket.onmessage = (event) => {
      if (event.data === "pong") return;
      try {
        const message: WebSocketMessage<any> = JSON.parse(event.data);
        if (message.type === EventTypes.NOTIFICATION) {
          get().receiveSocketMessage(message.data);
        }
      } catch (e) {
        console.error(e);
      }
    };

    socket.onclose = () => {
      console.log("🔴 WS Disconnected");
      set({ isConnected: false });
      socket = null;
    };

    // Ping Heartbeat
    clearInterval(pingInterval);
    pingInterval = setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) socket.send("ping");
    }, 36000);
  },

  disconnectSocket: () => {
    if (socket) socket.close();
    socket = null;
    clearInterval(pingInterval);
    set({ isConnected: false });
  },
}));
