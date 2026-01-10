"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { useNotificationStore } from "@/stores/use-notification-store";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function NotificationListener() {
  const notifications = useNotificationStore((state) => state.notifications);
  const router = useRouter();
  const t = useTranslations("Notifications"); // Dùng i18n nếu có

  // Lưu trữ ID của thông báo mới nhất đã xử lý
  const latestNotificationIdRef = useRef<string | number | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    // Nếu mảng rỗng, không làm gì cả
    if (!notifications || notifications.length === 0) return;

    const latestMsg = notifications[0];

    // LẦN ĐẦU LOAD:
    // Chỉ lưu lại ID mới nhất để làm mốc, KHÔNG Toast
    if (isFirstLoad.current) {
      latestNotificationIdRef.current = latestMsg.id;
      isFirstLoad.current = false;
      return;
    }

    // CÁC LẦN SAU (Socket hoặc Load more):
    // Chỉ Toast nếu ID của tin nhắn đầu tiên KHÁC với ID đã lưu
    // Điều này chặn việc Load More (vì Load More chỉ thêm vào đuôi, tin đầu vẫn y nguyên)
    if (latestMsg.id !== latestNotificationIdRef.current) {
      // Cập nhật lại ID mới nhất
      latestNotificationIdRef.current = latestMsg.id;

      // Logic hiển thị Toast
      if (latestMsg.isRead === 0) {
        // Play sound (Optional)
        // const audio = new Audio('/notification.mp3');
        // audio.play().catch(() => {});

        toast(latestMsg.payload.title, {
          description: latestMsg.payload.content,
          // Sử dụng màu primary thay vì blue-500 hardcode
          icon: <Bell className="h-4 w-4 text-primary" />,
          duration: 5000,
          // Style lại toast cho giống theme
          className: "group border-primary/20 bg-card/80 backdrop-blur-md",
          action: {
            label: "Xem", // Hoặc t('actions.view')
            onClick: () => {
              if (latestMsg.payload.linkUrl) {
                router.push(latestMsg.payload.linkUrl);
              }
            },
          },
        });
        console.log("🔔 New notification received:", latestMsg.id);
      }
    }
  }, [notifications, router]);

  return null;
}
