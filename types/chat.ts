export enum ConversationType {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
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

export interface ConversationWithPreview extends Conversation {
  lastMessageContent?: string;
  lastMessageType?: MessageType;
  lastSenderId?: string;
  unreadCount?: number; 
}


export interface Participant {
  conversationId: string;
  employeeId: string;
  role: string; 
  
  fullName: string;
  imageUrl: string;
  
  joinedAt?: string;
  isMuted?: boolean;
  isPinned?: boolean;

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
  reaction: string; 
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
