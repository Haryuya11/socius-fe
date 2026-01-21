"use client";

import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useNotificationStore } from "@/stores/use-notification-store";
import { socketManager } from "@/services/socket-manager";
import { useChatStore } from "@/stores/use-chat-store";

export default function SocketInitializer() {
  const { accounts } = useMsal();
  const { setCurrentUser } = useChatStore();
  const fetchNoti = useNotificationStore((state) => state.fetchInitialData);

  useEffect(() => {
    // Chỉ kết nối khi đã đăng nhập
    if (accounts.length > 0) {
      console.log("🔄 Initializing Global Socket & Data...");

      const uid =
        accounts[0].localAccountId || accounts[0].homeAccountId.split(".")[0];

      // Update Store ngay khi có account
      setCurrentUser(uid);

      // 1. Kết nối WebSocket Global
      socketManager.connect();

      // 2. Load dữ liệu nền (Notification)
      fetchNoti();
    } else {
      // Nếu logout -> ngắt kết nối
      socketManager.disconnect();

      //  THAY ĐỔI: Xóa user khỏi store để tránh hiển thị sai khi login user khác
      // (Do đã dùng persist nên nếu không xóa, user cũ vẫn còn trong LocalStorage)
      setCurrentUser(null);
    }

    return () => {
      // Cleanup nếu cần
    };
  }, [accounts, fetchNoti, setCurrentUser]);

  return null;
}
