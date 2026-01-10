// services/notification-service.ts
import http from "@/lib/axios";
import { NotificationMessage } from "@/types/notification";

// Định nghĩa kiểu dữ liệu trả về từ API List
interface NotificationResponse {
  data: NotificationMessage[];
  nextCursor: string | null;
  hasNext: boolean;
}

export const notificationService = {
  // 1. Lấy danh sách
  getList: async (limit: number = 10, cursor?: string) => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (cursor) params.append("cursor", cursor);

    const res = await http.get<{ data: NotificationResponse }>(
      `/api/notifications`,
      { params }
    );

    // API trả về: { success: true, data: { data: [], nextCursor: ... } }
    return res.data.data;
  },

  // 2. Lấy số lượng chưa đọc
  getUnreadCount: async () => {
    const res = await http.get<{ data: number }>("/api/notifications/unread");

    // API trả về: { success: true, data: 14 }
    return res.data.data;
  },

  // 3. Mark Read
  markAsRead: async (id: number | string) => {
    return http.put(`/api/notifications/read/${id}`);
  },

  // 4. Mark All Read
  markAllRead: async () => {
    return http.put("/api/notifications/mark-all");
  },
};
