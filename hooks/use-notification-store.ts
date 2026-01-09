// hooks/use-notification-store.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { NotificationMessage } from "@/types/notification";
import { notificationService } from "@/services/notification-service";
import { useNotificationSocket } from "./use-notification-socket";

export function useNotificationStore() {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  // 1. Kết nối Socket
  const { notifications: socketNotifications } = useNotificationSocket();
  const prevSocketLength = useRef(0);

  useEffect(() => {
    if (socketNotifications.length > prevSocketLength.current) {
      const newMsg = socketNotifications[0];
      setNotifications((prev) => {
        const currentList = Array.isArray(prev) ? prev : [];
        // Tránh trùng lặp
        if (currentList.find((n) => n.id === newMsg.id)) return currentList;
        return [newMsg, ...currentList];
      });
      setUnreadCount((prev) => prev + 1);
      prevSocketLength.current = socketNotifications.length;
    }
  }, [socketNotifications]);

  // 2. FETCH INITIAL DATA (SỬA ĐOẠN NÀY)
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [listRes, countRes] = await Promise.all([
        notificationService.getList(10),
        notificationService.getUnreadCount(),
      ]);

      const apiList = Array.isArray(listRes.data) ? listRes.data : [];
      const cursor = listRes.nextCursor;

      // --- SỬA LOGIC GÁN STATE ---
      // Thay vì setNotifications(apiList) -> Ghi đè mất tin socket
      // Ta dùng hàm callback để merge:
      setNotifications((prevSocketMsgs) => {
        // prevSocketMsgs: Là những tin socket vừa nhận được trong lúc API đang loading
        // apiList: Là danh sách từ Database

        // Gộp 2 mảng lại
        const combined = [...prevSocketMsgs, ...apiList];

        // Lọc trùng (Deduplicate) dựa trên ID (ưu tiên tin socket mới hơn)
        const uniqueList = combined.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );

        // Sắp xếp lại theo thời gian giảm dần (Mới nhất lên đầu)
        return uniqueList.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      // ----------------------------

      setNextCursor(cursor ?? undefined);
      setUnreadCount(countRes);

      if (!cursor || apiList.length < 10) setHasMore(false);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. Load More (Cũng cần merge cẩn thận)
  const loadMore = async () => {
    if (isLoading || !hasMore || !nextCursor) return;

    try {
      setIsLoading(true);
      const res = await notificationService.getList(10, nextCursor);
      const newList = Array.isArray(res.data) ? res.data : [];
      const newCursor = res.nextCursor;

      setNotifications((prev) => {
        const combined = [...prev, ...newList];
        // Lọc trùng ID
        const uniqueList = combined.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );
        return uniqueList;
      });

      setNextCursor(newCursor ?? undefined);

      if (!newCursor || newList.length === 0) setHasMore(false);
    } catch (error) {
      console.error("Load more error", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (Phần còn lại giữ nguyên) ...
  const markRead = async (id: number) => {
    /* ... */
  };
  const markAllRead = async () => {
    /* ... */
  };

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    loadMore,
    markRead,
    markAllRead,
  };
}
