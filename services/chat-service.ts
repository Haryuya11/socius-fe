import http from "@/lib/axios";
import {
  Conversation,
  ConversationListResponse,
  Message,
  MessageListResponse,
  Participant,
  MessageMetadata,
  MessageType,
  MessageReaction,
} from "@/types/chat";

export const chatService = {
  getConversations: async (limit: number = 20, cursor?: string) => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (cursor) params.append("cursor", cursor);
    const res = await http.get<{ data: ConversationListResponse }>(
      "/api/conversations",
      { params },
    );
    const responseData = res.data.data;
    return {
      data: responseData.data,
      nextCursor: responseData.nextCursor,
      hasNext: responseData.hasNext,
    };
  },

  getMessageDetail: async (messageId: string) => {
    const res = await http.get<{ data: Message }>(`/api/messages/${messageId}`);
    return res.data.data;
  },

  getConversationDetail: async (id: string) => {
    const res = await http.get<{ data: Conversation }>(
      `/api/conversations/${id}`,
    );
    return res.data.data;
  },

  createDirectConversation: async (partnerId: string) => {
    const res = await http.post<{ data: Conversation }>(
      `/api/conversations/direct/${partnerId}`,
      {},
    );
    return res.data.data;
  },

  createGroupConversation: async (
    name: string,
    participantIds: string[],
    avatarUrl: string = "",
  ) => {
    const res = await http.post<{ data: Conversation }>(
      "/api/conversations/group",
      {
        name,
        participantIds,
        avatarUrl,
      },
    );
    return res.data.data;
  },

  updateConversation: async (
    id: string,
    data: { name?: string; avatarUrl?: string },
  ) => {
    const res = await http.put<{ data: Conversation }>(
      `/api/conversations/${id}`,
      data,
    );
    return res.data.data;
  },

  deleteConversation: async (id: string) => {
    return http.delete(`/api/conversations/${id}`);
  },

  leaveConversation: async (id: string) => {
    return http.post(`/api/conversations/${id}/leave`);
  },

  uploadConversationAvatar: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    // Lưu ý: Content-Type multipart/form-data thường được axios tự set khi thấy FormData
    const res = await http.post(`/api/conversations/${id}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data; // { path, url }
  },

  // --- PARTICIPANTS ---
  getParticipants: async (conversationId: string) => {
    const res = await http.get<{ data: Participant[] }>(
      `/api/conversations/${conversationId}/participants`,
    );
    return res.data.data;
  },

  addParticipants: async (
    conversationId: string,
    participants: { employeeId: string; role: string }[],
  ) => {
    const res = await http.post<{ data: Participant[] }>(
      `/api/conversations/${conversationId}/participants`,
      { participants },
    );
    return res.data.data;
  },

  removeParticipants: async (conversationId: string, employeeIds: string[]) => {
    // Axios delete body config
    return http.delete(`/api/conversations/${conversationId}/participants`, {
      data: employeeIds,
    });
  },

  // --- MESSAGES ---
  getMessages: async (
    conversationId: string,
    limit: number = 20,
    cursor?: string,
  ) => {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (cursor) params.append("cursor", cursor);

    const res = await http.get<{ data: MessageListResponse }>(
      `/api/conversations/${conversationId}/messages`,
      { params },
    );
    const responseData = res.data.data;
    return {
      data: responseData.data,
      nextCursor: responseData.nextCursor,
      hasNext: responseData.hasNext,
    };
  },

  sendMessage: async (payload: {
    conversationId: string;
    content: string;
    messageType: MessageType;
    parentMessageId?: string;
    metadata?: MessageMetadata[];
  }) => {
    const body = {
      conversationId: payload.conversationId,
      content: payload.content,
      messageType: payload.messageType,
      parentMessageId: payload.parentMessageId || "",
      metadata: payload.metadata || [],
    };
    const res = await http.post<{ data: Message }>("/api/messages", body);
    return res.data.data;
  },

  uploadAttachments: async (conversationId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await http.post<{ data: MessageMetadata[] }>(
      `/api/conversations/${conversationId}/messages/attachments`,
      formData,
      {
        headers: {
          "Content-Type": undefined as unknown as string,
        },
        timeout: 300000,
      },
    );
    return res.data.data;
  },

  updateMessage: async (messageId: string, content: string) => {
    const res = await http.put<{ data: Message }>(
      `/api/messages/${messageId}`,
      { content },
    );
    return res.data.data;
  },

  deleteMessage: async (messageId: string) => {
    return http.delete(`/api/messages/${messageId}`);
  },

  markRead: async (conversationId: string, messageId: string) => {
    return http.put(`/api/conversations/${conversationId}/read/${messageId}`);
  },

  // --- REACTIONS ---
  addReaction: async (messageId: string, reaction: string) => {
    const res = await http.post<{ data: MessageReaction }>(
      "/api/messages/reactions",
      { messageId, reaction },
    );
    return res.data.data;
  },

  removeReaction: async (messageId: string, reaction: string) => {
    return http.delete("/api/messages/reactions", {
      data: { messageId, reaction },
    });
  },

  getReactions: async (messageId: string) => {
    const res = await http.get<{ data: MessageReaction[] }>(
      `/api/messages/${messageId}/reactions`,
    );
    return res.data.data;
  },
};
