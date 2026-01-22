/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  ConversationWithPreview,
  Message,
  MessageType,
  Participant,
  MessageMetadata,
  ConversationType,
} from "@/types/chat";
import { chatService } from "@/services/chat-service";
import { toast } from "sonner";
import { DomainTypes, EventTypes } from "@/types/notification";

interface ChatState {
  conversations: ConversationWithPreview[];
  searchResults: ConversationWithPreview[];
  isSearching: boolean;
  activeConversationId: string | null;
  messages: Message[];
  participants: Participant[];
  currentUserId: string | null;
  setCurrentUser: (id: string | null) => void;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  hasMoreConversations: boolean;
  conversationCursor: string | null;
  hasMoreMessages: boolean;
  messageCursor: string | null;
  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;
  isConnected: boolean;

  loadConversations: (isRefresh?: boolean) => Promise<void>;
  searchConversations: (keyword: string) => Promise<void>;
  clearSearch: () => void;
  selectConversation: (id: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  markConversationAsRead: (id: string) => void;
  sendMessage: (
    content: string,
    type: MessageType,
    files?: File[],
    parentMessageId?: string,
  ) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, reaction: string) => Promise<void>;
  removeReaction: (messageId: string, reaction: string) => Promise<void>;
  receiveSocketMessage: (msg: any) => void;

  addConversationToStore: (conv: ConversationWithPreview) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      searchResults: [],
      isSearching: false,
      activeConversationId: null,
      messages: [],
      participants: [],
      currentUserId: null,
      setCurrentUser: (id) => set({ currentUserId: id }),
      isLoadingConversations: false,
      isLoadingMessages: false,
      hasMoreConversations: true,
      conversationCursor: null,
      hasMoreMessages: true,
      messageCursor: null,
      replyingTo: null,
      setReplyingTo: (message) => set({ replyingTo: message }),
      isConnected: false,

      receiveSocketMessage: (wsMsg) => {
        if (wsMsg.domain !== DomainTypes.MESSAGE) return;
        const { activeConversationId, conversations, messages } = get();

        // [FIX] Khai báo eventData ở đây để dùng chung cho switch case
        const eventData = wsMsg.data;

        // Payload tin nhắn (dùng cho NEW_MESSAGE, UPDATE, DELETE)
        const messageSource = eventData.message || eventData;

        const payload: Message = {
          messageId: messageSource.messageId,
          conversationId: messageSource.conversationId,
          senderId: messageSource.senderId,
          content: messageSource.content || "",
          messageType: messageSource.messageType || MessageType.TEXT,
          parentMessageId: messageSource.parentMessageId || "",
          metadata: messageSource.metadata || [],
          isEdited: messageSource.isEdited || false,
          editedAt: messageSource.editedAt || null,
          createdAt: messageSource.createdAt || new Date().toISOString(),
          reactions: messageSource.reactions || [],
        };

        switch (wsMsg.type) {
          case EventTypes.NEW_MESSAGE: {
            const isActive = activeConversationId === payload.conversationId;

            const existingConv = conversations.find(
              (c) => c.conversationId === payload.conversationId,
            );
            if (!existingConv) {
              get().loadConversations(true);
              return;
            }
            const newUnreadCount = isActive
              ? 0
              : (existingConv.unreadCount || 0) + 1;

            const newConvData: ConversationWithPreview = {
              ...existingConv,
              lastMessageAt: payload.createdAt,
              lastMessageId: payload.messageId,
              lastMessageContent:
                payload.content ||
                (payload.messageType === MessageType.IMAGE
                  ? "Đã gửi một ảnh"
                  : payload.messageType === MessageType.FILE
                    ? "Đã gửi một tệp"
                    : ""),
              lastMessageType: payload.messageType || MessageType.TEXT,
              lastSenderId: payload.senderId || "",
              unreadCount: newUnreadCount,
            };

            const otherConversations = conversations.filter(
              (c) => c.conversationId !== payload.conversationId,
            );
            const updatedConversations = [newConvData, ...otherConversations];

            let updatedMessages = messages;
            if (isActive) {
              if (!messages.some((m) => m.messageId === payload.messageId)) {
                updatedMessages = [payload, ...messages];
              }
            }

            set({
              conversations: updatedConversations,
              messages: updatedMessages,
            });
            break;
          }

          case EventTypes.MESSAGE_UPDATED: {
            if (activeConversationId === payload.conversationId) {
              set({
                messages: messages.map((m) =>
                  m.messageId === payload.messageId ? { ...m, ...payload } : m,
                ),
              });
            }
            set((state) => ({
              conversations: state.conversations.map((c) =>
                c.conversationId === payload.conversationId &&
                c.lastMessageId === payload.messageId
                  ? { ...c, lastMessageContent: payload.content }
                  : c,
              ),
            }));
            break;
          }

          case EventTypes.MESSAGE_DELETED: {
            if (activeConversationId === payload.conversationId) {
              set({
                messages: messages.map((m) =>
                  m.messageId === payload.messageId
                    ? { ...m, content: "Tin nhắn đã bị thu hồi", metadata: [] }
                    : m,
                ),
              });
            }
            break;
          }

          case EventTypes.REACTION_ADDED: {
            // [FIX] Sử dụng eventData đã khai báo ở trên
            const { conversationId, messageId, reaction } = eventData;

            if (activeConversationId !== conversationId) return;

            set({
              messages: messages.map((m) => {
                if (m.messageId === messageId) {
                  const exists = m.reactions?.some(
                    (r) =>
                      r.employeeId === reaction.employeeId &&
                      r.reaction === reaction.reaction,
                  );
                  if (exists) return m;
                  return {
                    ...m,
                    reactions: [...(m.reactions || []), reaction],
                  };
                }
                return m;
              }),
            });
            break;
          }

          case EventTypes.REACTION_REMOVED: {
            // [FIX] Sử dụng eventData đã khai báo ở trên
            const { conversationId, messageId, employeeId, reactionType } =
              eventData;

            if (activeConversationId !== conversationId) return;

            set({
              messages: messages.map((m) =>
                m.messageId === messageId
                  ? {
                      ...m,
                      reactions: (m.reactions || []).filter(
                        (r) =>
                          !(
                            r.employeeId === employeeId &&
                            r.reaction === reactionType
                          ),
                      ),
                    }
                  : m,
              ),
            });
            break;
          }
        }
      },

      loadConversations: async (isRefresh = false) => {
        if (get().isLoadingConversations) return;

        set({ isLoadingConversations: true });
        try {
          const cursor = isRefresh
            ? undefined
            : get().conversationCursor || undefined;
          if (!isRefresh && !get().hasMoreConversations) {
            set({ isLoadingConversations: false });
            return;
          }

          const res = await chatService.getConversations(20, cursor);

          const mappedData: ConversationWithPreview[] = res.data.map(
            (conv: any) => ({
              conversationId: conv.conversationId,
              type: conv.type,
              name:
                conv.name ||
                (conv.type === "DIRECT"
                  ? "Cuộc trò chuyện"
                  : "Nhóm chưa đặt tên"),
              avatarUrl: conv.avatarUrl,
              createdBy: conv.createdBy,
              lastMessageId: conv.lastMessageId,
              lastMessageAt: conv.lastMessageAt,
              createdAt: conv.createdAt,
              lastMessageContent:
                conv.lastMessageContent ||
                (conv.lastMessageId ? "Đang tải..." : ""),
              lastMessageType: conv.lastMessageType || MessageType.TEXT,
              lastSenderId: conv.lastSenderId,
              unreadCount: conv.unreadCount || 0,
            }),
          );

          set((state) => ({
            conversations: isRefresh
              ? mappedData
              : [...state.conversations, ...mappedData],
            conversationCursor: res.nextCursor || null,
            hasMoreConversations: res.hasNext || false,
          }));

          const conversationsWithMsg = mappedData.filter(
            (c) => c.lastMessageId && c.lastMessageContent === "Đang tải...",
          );

          if (conversationsWithMsg.length > 0) {
            const details = await Promise.allSettled(
              conversationsWithMsg.map(async (c) => {
                try {
                  return await chatService.getMessageDetail(c.lastMessageId!);
                } catch (error) {
                  return { messageId: c.lastMessageId, isError: true };
                }
              }),
            );

            const msgMap = new Map<string, any>();
            details.forEach((result) => {
              if (result.status === "fulfilled" && result.value) {
                const msgId = result.value.messageId;
                if (msgId) {
                  msgMap.set(msgId, result.value);
                }
              }
            });

            set((state) => ({
              conversations: state.conversations.map((c) => {
                if (c.lastMessageId && msgMap.has(c.lastMessageId)) {
                  const msg = msgMap.get(c.lastMessageId)!;
                  if (msg.isError) {
                    return {
                      ...c,
                      lastMessageContent:
                        "Tin nhắn đã bị xóa hoặc không tồn tại",
                    };
                  }
                  return {
                    ...c,
                    lastMessageContent:
                      msg.content ||
                      (msg.messageType === MessageType.IMAGE
                        ? "Đã gửi một ảnh"
                        : msg.messageType === MessageType.FILE
                          ? "Đã gửi một tệp"
                          : ""),
                    lastMessageType: msg.messageType,
                    lastSenderId: msg.senderId,
                  };
                }
                return c;
              }),
            }));
          }
        } catch (e) {
          console.error(e);
        } finally {
          set({ isLoadingConversations: false });
        }
      },

      searchConversations: async (keyword) => {
        if (!keyword.trim()) {
          set({ searchResults: [], isSearching: false });
          return;
        }

        set({ isSearching: true });
        try {
          const rawData = await chatService.searchConversations(keyword);
          const currentConversations = get().conversations;

          const mappedResults: ConversationWithPreview[] = rawData.map(
            (conv: any) => {
              const existingConv = currentConversations.find(
                (c) => c.conversationId === conv.conversationId,
              );
              if (existingConv) {
                return existingConv;
              }
              return {
                conversationId: conv.conversationId,
                type: conv.type,
                name:
                  conv.name ||
                  (conv.type === ConversationType.DIRECT
                    ? "Cuộc trò chuyện"
                    : "Nhóm chưa đặt tên"),
                avatarUrl: conv.avatarUrl,
                createdBy: conv.createdBy,
                lastMessageId: conv.lastMessageId,
                lastMessageAt: conv.lastMessageAt,
                createdAt: conv.createdAt,
                lastMessageContent: "",
                lastMessageType: MessageType.TEXT,
                lastSenderId: "",
                unreadCount: 0,
              };
            },
          );

          set({ searchResults: mappedResults });
        } catch (error) {
          console.error("Search failed", error);
          toast.error("Tìm kiếm thất bại");
          set({ searchResults: [] });
        } finally {
          set({ isSearching: false });
        }
      },

      clearSearch: () => {
        set({ searchResults: [], isSearching: false });
      },

      addConversationToStore: (conv) => {
        set((state) => {
          if (
            state.conversations.some(
              (c) => c.conversationId === conv.conversationId,
            )
          ) {
            return state;
          }
          return { conversations: [conv, ...state.conversations] };
        });
      },

      selectConversation: async (id) => {
        set({
          activeConversationId: id,
          messages: [],
          participants: [],
          messageCursor: null,
          hasMoreMessages: true,
          isLoadingMessages: true,
          replyingTo: null,
        });

        get().markConversationAsRead(id);

        try {
          const [msgsRes, partsRes] = await Promise.all([
            chatService.getMessages(id, 20),
            chatService.getParticipants(id),
          ]);

          const existingConv = get().conversations.find(
            (c) => c.conversationId === id,
          );

          if (!existingConv) {
            const detail = await chatService.getConversationDetail(id);
            if (detail) {
              let displayName = detail.name;
              let displayAvatar = detail.avatarUrl;

              if (detail.type === ("DIRECT" as ConversationType) && partsRes) {
                const partner = partsRes.find(
                  (p) => p.employeeId !== get().currentUserId,
                );
                if (partner) {
                  displayName = partner.fullName;
                  displayAvatar = partner.imageUrl;
                }
              }

              const newConvPreview: ConversationWithPreview = {
                conversationId: detail.conversationId,
                type: detail.type,
                name: displayName || "Cuộc trò chuyện",
                avatarUrl: displayAvatar,
                createdBy: detail.createdBy,
                lastMessageId: detail.lastMessageId,
                lastMessageAt: detail.lastMessageAt,
                createdAt: detail.createdAt,
                lastMessageContent: "",
                lastMessageType: MessageType.TEXT,
                lastSenderId: "",
                unreadCount: 0,
              };

              set((state) => ({
                conversations: [newConvPreview, ...state.conversations],
              }));
            }
          }

          set({
            messages: msgsRes.data || [],
            messageCursor: msgsRes.nextCursor || null,
            hasMoreMessages: msgsRes.hasNext || false,
            participants: partsRes || [],
            isLoadingMessages: false,
          });

          if (msgsRes.data && msgsRes.data.length > 0) {
            const firstMsg = msgsRes.data[0];
            chatService.markRead(id, firstMsg.messageId).catch(() => {});
          }
        } catch (e) {
          console.error("Error loading conversation:", e);
          toast.error("Không thể tải cuộc trò chuyện");
          set({ isLoadingMessages: false });
        }
      },

      markConversationAsRead: (id: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.conversationId === id ? { ...c, unreadCount: 0 } : c,
          ),
        }));
      },

      loadMoreMessages: async () => {
        const {
          activeConversationId,
          messageCursor,
          hasMoreMessages,
          isLoadingMessages,
          messages,
        } = get();
        if (
          !activeConversationId ||
          !hasMoreMessages ||
          !messageCursor ||
          isLoadingMessages
        )
          return;

        set({ isLoadingMessages: true });
        try {
          const res = await chatService.getMessages(
            activeConversationId,
            20,
            messageCursor,
          );
          set({
            messages: [...messages, ...res.data],
            messageCursor: res.nextCursor || null,
            hasMoreMessages: res.hasNext || false,
          });
        } finally {
          set({ isLoadingMessages: false });
        }
      },

      sendMessage: async (content, type, files, parentMessageId) => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;

        try {
          let allMetadata: MessageMetadata[] = [];
          if (files && files.length > 0) {
            const uploadRes = await chatService.uploadAttachments(
              activeConversationId,
              files,
            );
            if (uploadRes) {
              allMetadata = uploadRes;
            }
          }
          const imageMetadata = allMetadata.filter((m) =>
            m.mimeType.startsWith("image/"),
          );
          const otherMetadata = allMetadata.filter(
            (m) => !m.mimeType.startsWith("image/"),
          );

          if (content.trim() || imageMetadata.length > 0) {
            const msgType =
              imageMetadata.length > 0 ? MessageType.IMAGE : MessageType.TEXT;

            const mainMsg = await chatService.sendMessage({
              conversationId: activeConversationId,
              content: content || "",
              messageType: msgType,
              metadata: imageMetadata,
              parentMessageId: parentMessageId,
            });

            get().receiveSocketMessage({
              domain: DomainTypes.MESSAGE,
              type: EventTypes.NEW_MESSAGE,
              data: mainMsg,
            });
          }

          if (otherMetadata.length > 0) {
            for (const fileMeta of otherMetadata) {
              const fileMsg = await chatService.sendMessage({
                conversationId: activeConversationId,
                content: "",
                messageType: MessageType.FILE,
                metadata: [fileMeta],
                parentMessageId: parentMessageId,
              });

              get().receiveSocketMessage({
                domain: DomainTypes.MESSAGE,
                type: EventTypes.NEW_MESSAGE,
                data: fileMsg,
              });
            }
          }
        } catch (error) {
          console.error("Send message error:", error);
          toast.error("Gửi tin nhắn thất bại");
        }
      },

      editMessage: async (messageId, newContent) => {
        try {
          const updated = await chatService.updateMessage(
            messageId,
            newContent,
          );
          set((state) => ({
            messages: state.messages.map((m) =>
              m.messageId === messageId ? updated : m,
            ),
          }));
        } catch {
          toast.error("Sửa tin nhắn thất bại");
        }
      },

      deleteMessage: async (messageId) => {
        try {
          await chatService.deleteMessage(messageId);
          set((state) => ({
            messages: state.messages.map((m) =>
              m.messageId === messageId
                ? { ...m, content: "Tin nhắn đã bị thu hồi", metadata: [] }
                : m,
            ),
          }));
        } catch {
          toast.error("Xóa tin nhắn thất bại");
        }
      },

      addReaction: async (messageId, reaction) => {
        const { currentUserId, messages } = get();
        if (!currentUserId) {
          toast.error("Bạn chưa xác thực");
          return;
        }
        const optimisticReaction = {
          messageId,
          employeeId: currentUserId,
          reaction,
          createdAt: new Date().toISOString(),
        };
        const originalMessages = [...messages];
        set({
          messages: messages.map((m) =>
            m.messageId === messageId
              ? {
                  ...m,
                  reactions: [...(m.reactions || []), optimisticReaction],
                }
              : m,
          ),
        });
        try {
          await chatService.addReaction(messageId, reaction);
        } catch (error) {
          toast.error("Lỗi");
          set({ messages: originalMessages });
        }
      },

      removeReaction: async (messageId, reaction) => {
        const { currentUserId, messages } = get();
        if (!currentUserId) return;
        const originalMessages = [...messages];
        set({
          messages: messages.map((m) =>
            m.messageId === messageId
              ? {
                  ...m,
                  reactions: (m.reactions || []).filter(
                    (r) =>
                      r.employeeId !== currentUserId || r.reaction !== reaction,
                  ),
                }
              : m,
          ),
        });
        try {
          await chatService.removeReaction(messageId, reaction);
        } catch (error) {
          toast.error("Lỗi");
          set({ messages: originalMessages });
        }
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentUserId: state.currentUserId }),
    },
  ),
);
