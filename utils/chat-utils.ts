// utils/chat-utils.ts
import { MessageType } from "@/types/chat";

export function getMessagePreview(
  content: string | null,
  messageType: MessageType,
  isMe: boolean,
  senderName?: string,
): string {
  const prefix = isMe ? "Bạn: " : senderName ? `${senderName}: ` : "";

  switch (messageType) {
    case MessageType.IMAGE:
      return `${prefix}Đã gửi một ảnh`;
    case MessageType.FILE:
      return `${prefix}Đã gửi một tệp`;
    case MessageType.TEXT:
    default:
      if (!content || content.trim() === "") return `${prefix}Đã gửi tin nhắn`;
      // Truncate long messages
      return `${prefix}${content.substring(0, 50)}${content.length > 50 ? "..." : ""}`;
  }
}
