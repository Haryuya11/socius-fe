"use client";

import { useEffect } from "react";
import { useNotificationStore } from "@/stores/use-notification-store";
import { useMsal } from "@azure/msal-react";

export default function NotificationInitializer() {
  const { connectSocket, disconnectSocket, fetchInitialData } =
    useNotificationStore();
  const { accounts } = useMsal();

  useEffect(() => {
    // Chỉ connect khi user đã login
    if (accounts.length > 0) {
      connectSocket();
      fetchInitialData();
    }

    return () => {
      disconnectSocket();
    };
  }, [accounts, connectSocket, disconnectSocket, fetchInitialData]);

  return null; // Component không render gì cả
}
