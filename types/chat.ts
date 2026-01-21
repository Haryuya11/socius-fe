export enum ConversationType {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  // SYSTEM = "SYSTEM", // Nếu có tin nhắn hệ thống
}

export interface Conversation {
  conversationId: string;
  type: ConversationType;
  name: string | null;
  avatarUrl: string | null;
  createdBy: string;
  lastMessageId: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

// Backend trả về kèm theo lastMessage info
export interface ConversationWithPreview extends Conversation {
  lastMessageContent?: string;
  lastMessageType?: MessageType;
  lastSenderId?: string;
  unreadCount?: number; 
}

export interface Participant {
  conversationId: string;
  employeeId: string;
  role: "ADMIN" | "MEMBER";
  joinedAt: string;
  lastReadMessageId: string | null;
  lastReadAt: string | null;
  isMuted: boolean;
  isPinned: boolean;
  // Có thể cần join với bảng User để lấy tên/avatar hiển thị
  employeeDetails?: {
    fullName: string;
    avatarUrl: string;
  };
}

export interface MessageMetadata {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
}

export interface MessageReaction {
  messageId: string;
  employeeId: string;
  reaction: string; // e.g., "LIKE", "HAHA"
  createdAt: string;
}

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  parentMessageId: string | null | "";
  metadata: MessageMetadata[] | null;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  reactions?: MessageReaction[];
}

// API Responses
export interface ConversationListResponse {
  data: Conversation[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface MessageListResponse {
  data: Message[];
  nextCursor: string | null;
  hasNext: boolean;
}
