/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import {
  NotificationMessage,
  WebSocketMessage,
  EventTypes,
} from "@/types/notification";
import { notificationService } from "@/services/notification-service";
import { getValidToken } from "@/lib/axios";

// ... (Giữ nguyên hàm getWebSocketUrl) ...
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

  fetchInitialData: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
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

  receiveSocketMessage: (newMsg) => {
    set((state) => {
      const exists = state.notifications.find((n) => n.id === newMsg.id);
      if (exists) return state;
      return {
        notifications: [newMsg, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };
    });
  },

  // ---------------------------------------------------------
  // 👇 ĐÃ SỬA: Logic Fetch đơn giản hóa theo Service mới
  // ---------------------------------------------------------
  fetchInitialData: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });

    try {
      const [listData, unreadNum] = await Promise.all([
        notificationService.getList(10), // Trả về { data: [], nextCursor: ... }
        notificationService.getUnreadCount(), // Trả về number (ví dụ: 14)
      ]);

      // 1. Lấy mảng thông báo
      const apiList = Array.isArray(listData.data) ? listData.data : [];

      // 2. Lấy Cursor
      const cursor = listData.nextCursor;

      // 3. Lấy số lượng unread (đảm bảo là số)
      const safeCount = typeof unreadNum === "number" ? unreadNum : 0;

      set((state) => {
        // Merge với socket (nếu có)
        const combined = [...state.notifications, ...apiList];

        // Lọc trùng ID
        const uniqueList = combined.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );

        // Sort mới nhất lên đầu
        uniqueList.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
          notifications: uniqueList,
          unreadCount: safeCount,
          nextCursor: cursor ?? undefined, // Chuyển null thành undefined cho an toàn
          hasMore: !!cursor, // API trả về hasNext: true nhưng ta cứ check cursor cho chắc
        };
      });
    } catch (error) {
      console.error("Fetch init error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // ---------------------------------------------------------
  // 👇 ĐÃ SỬA: Logic Load More
  // ---------------------------------------------------------
  loadMore: async () => {
    const { isLoading, hasMore, nextCursor, notifications } = get();
    if (isLoading || !hasMore || !nextCursor) return;

    set({ isLoading: true });
    try {
      const res = await notificationService.getList(10, nextCursor);

      const newList = Array.isArray(res.data) ? res.data : [];
      const newCursor = res.nextCursor;

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

  // ---------------------------------------------------------
  // 👇 Logic Mark Read (Giữ nguyên vì đã chuẩn)
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // 👇 Logic Socket (Giữ nguyên)
  // ---------------------------------------------------------
  connectSocket: async () => {
    if (socket && socket.readyState === WebSocket.OPEN) return;
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

    clearInterval(pingInterval);
    pingInterval = setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) socket.send("ping");
    }, 15000);
  },

  disconnectSocket: () => {
    if (socket) socket.close();
    socket = null;
    clearInterval(pingInterval);
    set({ isConnected: false });
  },
}));
