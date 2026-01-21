/* eslint-disable @typescript-eslint/no-explicit-any */
import { getValidToken } from "@/lib/axios";
import { WebSocketMessage, DomainTypes } from "@/types/notification";
import { useNotificationStore } from "@/stores/use-notification-store";
import { useChatStore } from "@/stores/use-chat-store";

const getWebSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const protocol = apiUrl.startsWith("https") ? "wss://" : "ws://";
  const domain = apiUrl.replace(/^https?:\/\//, "");
  return `${protocol}${domain}/ws/hub`;
};

class SocketManager {
  private socket: WebSocket | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;

  async connect() {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) return;

    this.isConnecting = true;
    const token = await getValidToken();
    if (!token) {
      this.isConnecting = false;
      return;
    }

    const wsUrl = getWebSocketUrl();
    this.socket = new WebSocket(`${wsUrl}?token=${token}`);

    this.socket.onopen = () => {
      console.log("🟢 System WS Connected");
      this.isConnecting = false;
      this.startPing();

      useNotificationStore.setState({ isConnected: true });
      useChatStore.setState({ isConnected: true });
    };

    this.socket.onmessage = (event) => {
      if (event.data === "pong") return;
      try {
        const message: WebSocketMessage<any> = JSON.parse(event.data);

        switch (message.domain) {
          case DomainTypes.NOTIFICATION:
            useNotificationStore.getState().receiveSocketMessage(message);
            break;

          case DomainTypes.MESSAGE:
            useChatStore.getState().receiveSocketMessage(message);
            break;

        }
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };

    this.socket.onclose = () => {
      console.log("🔴 WS Disconnected");
      this.isConnecting = false;
      this.stopPing();
      this.socket = null;

      useNotificationStore.setState({ isConnected: false });
      useChatStore.setState({ isConnected: false });
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.stopPing();
  }

  private startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send("ping");
      }
    }, 30000);
  }

  private stopPing() {
    if (this.pingInterval) clearInterval(this.pingInterval);
  }
}

export const socketManager = new SocketManager();
