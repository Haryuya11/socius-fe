/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import {
  EventTypes,
  WebSocketMessage,
  NotificationMessage,
} from "@/types/notification";
import { getValidToken } from "@/lib/axios";

const getWebSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const protocol = apiUrl.startsWith("https") ? "wss://" : "ws://";
  const domain = apiUrl.replace(/^https?:\/\//, "");
  return `${protocol}${domain}/ws/hub`;
};

export const useNotificationSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isMounted = true;
    let pingInterval: NodeJS.Timeout; // Khai báo biến interval ở ngoài scope

    const connectWebSocket = async () => {
      const token = await getValidToken();

      // Nếu component đã unmount trong lúc chờ token, thì dừng luôn
      if (!isMounted) return;
      if (!token) return;

      const wsUrl = getWebSocketUrl();
      console.log(`Connecting to WS: ${wsUrl}`);

      const ws = new WebSocket(`${wsUrl}?token=${token}`);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("✅ Connected to Notification Hub");
        if (isMounted) setIsConnected(true);
      };

      ws.onmessage = (event) => {
        if (event.data === "pong") return;
        try {
          const message: WebSocketMessage<any> = JSON.parse(event.data);
          if (message.type === EventTypes.NOTIFICATION) {
            setNotifications((prev) => [message.data, ...prev]);
          }
        } catch (error) {
          console.error("Parse error:", error);
        }
      };

      ws.onclose = () => {
        console.log("❌ WS Disconnected");
        if (isMounted) setIsConnected(false);
      };

      ws.onerror = (e) => {
        // WS Error thường rỗng vì lý do bảo mật của trình duyệt
        console.error("WS connection error");
      };

      // Set interval ping (15s là an toàn nhất cho Azure/Nginx)
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send("ping");
        }
      }, 15000);
    };

    connectWebSocket();

    // Cleanup function chuẩn của useEffect
    return () => {
      isMounted = false;
      clearInterval(pingInterval); // Clear interval tại đây
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  return { isConnected, notifications };
};
