/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import {
  NotificationMessage,
  WebSocketMessage,
  EventTypes,
  DomainTypes,
  WsNotificationPayload,
} from "@/types/notification";
import { notificationService } from "@/services/notification-service";
import { getValidToken } from "@/lib/axios";

const normalizeNotification = (rawItem: any): NotificationMessage => {
  const title = rawItem.title || rawItem.payload?.title || "No Title";
  const content = rawItem.content || rawItem.payload?.content || "";

  const redirectUrl =
    rawItem.redirectUrl ||
    rawItem.linkUrl ||
    rawItem.payload?.redirectUrl ||
    rawItem.payload?.linkUrl;

  return {
    id: rawItem.id || rawItem.notificationId, 
    title: title,
    content: content,
    redirectUrl: redirectUrl,
    isRead: rawItem.isRead ?? 0,
    createdAt: rawItem.createdAt || new Date().toISOString(),
    deliveryType: rawItem.deliveryType,
  };
};

// Helper: Get WS URL
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

  // Actions
  fetchInitialData: () => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: number | string) => Promise<void>;
  markAllRead: () => Promise<void>;

  // Socket Actions
  connectSocket: () => void;
  disconnectSocket: () => void;
  receiveSocketMessage: (msg: WebSocketMessage<WsNotificationPayload>) => void;
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

  receiveSocketMessage: (wsMsg) => {
    if (
      wsMsg.domain !== DomainTypes.NOTIFICATION ||
      wsMsg.type !== EventTypes.NEW_NOTIFICATION
    ) {
      return;
    }

    const payload = wsMsg.data;

    const rawForMapper = { ...payload, id: payload.notificationId };
    const newNotification = normalizeNotification(rawForMapper);

    set((state) => {
      const currentList = Array.isArray(state.notifications)
        ? state.notifications
        : [];
      if (currentList.find((n) => n.id === newNotification.id)) return state;

      return {
        notifications: [newNotification, ...currentList],
        unreadCount: state.unreadCount + 1,
      };
    });
  },

  fetchInitialData: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });

    try {
      const [listRes, countRes] = await Promise.all([
        notificationService.getList(10),
        notificationService.getUnreadCount(),
      ]);

      const rawData = (listRes as any).data || listRes;
      const apiListRaw = Array.isArray(rawData) ? rawData : [];
      const apiList = apiListRaw.map(normalizeNotification);

      const cursor =
        (listRes as any).nextCursor || (listRes as any).meta?.next_cursor;
      const safeCount =
        typeof countRes === "number"
          ? countRes
          : ((countRes as any).count ?? 0);

      set((state) => {
        const currentNotis = state.notifications;
        const combined = [...currentNotis, ...apiList];
        const uniqueList = combined
          .filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.id === item.id),
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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

  loadMore: async () => {
    const { isLoading, hasMore, nextCursor, notifications } = get();
    if (isLoading || !hasMore || !nextCursor) return;

    set({ isLoading: true });
    try {
      const res = await notificationService.getList(10, nextCursor);
      const rawList = (res as any).data || res;
      const apiListRaw = Array.isArray(rawList) ? rawList : [];

      const newList = apiListRaw.map(normalizeNotification);

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

  markRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: 1 } : n,
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
        if (message.domain === DomainTypes.NOTIFICATION) {
          get().receiveSocketMessage(message);
        }
      } catch (e) {
        console.error("WS Parse Error", e);
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
    }, 30000);
  },

  disconnectSocket: () => {
    if (socket) socket.close();
    socket = null;
    clearInterval(pingInterval);
    set({ isConnected: false });
  },
}));
