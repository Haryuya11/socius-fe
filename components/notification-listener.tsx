"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";

// 👇 QUAN TRỌNG: Import từ store Zustand
import { useNotificationStore } from "@/stores/use-notification-store";

export default function NotificationListener() {
  // Chỉ lấy notifications để theo dõi
  const notifications = useNotificationStore((state) => state.notifications);

  // Dùng ref để so sánh độ dài, tránh toast nhầm khi F5 trang (lúc load API)
  const prevCountRef = useRef(0);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Nếu là lần đầu load trang (API fetch), cập nhật ref rồi return, không toast
    if (isFirstLoad.current && notifications.length > 0) {
      prevCountRef.current = notifications.length;
      isFirstLoad.current = false;
      return;
    }

    // Nếu số lượng tin nhắn tăng lên -> Có tin mới từ Socket
    if (notifications.length > prevCountRef.current) {
      const newMsg = notifications[0];

      // Chỉ hiện toast nếu tin đó chưa đọc
      if (newMsg && newMsg.isRead === 0) {
        toast(newMsg.payload.title, {
          description: newMsg.payload.content,
          icon: <Bell className="h-4 w-4 text-blue-500" />,
          duration: 5000,
          action: {
            label: "Xem",
            onClick: () => {
              if (newMsg.payload.linkUrl) {
                window.location.href = newMsg.payload.linkUrl;
              }
            },
          },
        });

        console.log("🔔 [Real-time Toast]:", newMsg);
      }
    }

    // Cập nhật lại ref
    prevCountRef.current = notifications.length;
  }, [notifications]);

  return null;
}
