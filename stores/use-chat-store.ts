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
} from "@/types/chat";
import { chatService } from "@/services/chat-service";
import { toast } from "sonner";
import { DomainTypes, EventTypes } from "@/types/notification";

interface ChatState {
  conversations: ConversationWithPreview[];
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

  // API Actions
  loadConversations: (isRefresh?: boolean) => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  markConversationAsRead: (id: string) => void;

  // Interaction Actions
  sendMessage: (
    content: string,
    type: MessageType,
    files?: File[],
    parentMessageId?: string, // Updated signature
  ) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  // Reaction Actions
  addReaction: (messageId: string, reaction: string) => Promise<void>;
  removeReaction: (messageId: string, reaction: string) => Promise<void>;

  // Socket
  receiveSocketMessage: (msg: any) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
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
        const rawData = wsMsg.data;

        const messageSource = rawData.message || rawData;

        // Construct message object carefully
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
            const convIndex = conversations.findIndex(
              (c) => c.conversationId === payload.conversationId,
            );

            const updatedConversations = [...conversations];
            const isActive = activeConversationId === payload.conversationId;

            if (convIndex !== -1) {
              const currentConv = updatedConversations[convIndex];
              const newUnreadCount = isActive
                ? 0
                : (currentConv.unreadCount || 0) + 1;

              const conv: ConversationWithPreview = {
                ...currentConv,
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

              updatedConversations.splice(convIndex, 1);
              updatedConversations.unshift(conv);
            } else {
              get().loadConversations(true); // Force reload if new conversation
              return;
            }

            let updatedMessages = messages;
            if (isActive) {
              const isDuplicate = messages.some(
                (m) => m.messageId === payload.messageId,
              );
              if (!isDuplicate) {
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
            // Update sidebar preview if needed
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
              // Don't remove completely, just mark as deleted content
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

          // Handle socket reactions if your backend emits them
          case EventTypes.REACTION_ADDED: {
            const reactionData = wsMsg.data; // { messageId, employeeId, reaction, ... }
            set({
              messages: messages.map((m) => {
                if (m.messageId === reactionData.messageId) {
                  // Check trùng lặp
                  const exists = m.reactions?.some(
                    (r) =>
                      r.employeeId === reactionData.employeeId &&
                      r.reaction === reactionData.reaction,
                  );
                  if (exists) return m;

                  return {
                    ...m,
                    reactions: [...(m.reactions || []), reactionData],
                  };
                }
                return m;
              }),
            });
            break;
          }

          case EventTypes.REACTION_REMOVED: {
            const { messageId, employeeId, reaction } = wsMsg.data;
            set({
              messages: messages.map((m) =>
                m.messageId === messageId
                  ? {
                      ...m,
                      reactions: (m.reactions || []).filter(
                        (r) =>
                          !(
                            r.employeeId === employeeId &&
                            r.reaction === reaction
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

      // Trong use-chat-store.ts

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

          // 1. Map dữ liệu ban đầu
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

          // 2. Logic: Tìm các hội thoại cần fetch detail tin nhắn
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

      selectConversation: async (id) => {
        set({
          activeConversationId: id,
          messages: [],
          participants: [],
          messageCursor: null,
          hasMoreMessages: true,
          isLoadingMessages: true,
          replyingTo: null, // Reset reply
        });

        get().markConversationAsRead(id);

        try {
          const [msgsRes, partsRes] = await Promise.all([
            chatService.getMessages(id, 20),
            chatService.getParticipants(id),
          ]);

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
          let metadata: MessageMetadata[] = [];

          if (files && files.length > 0) {
            const uploadRes = await chatService.uploadAttachments(
              activeConversationId,
              files,
            );
            if (uploadRes) {
              metadata = uploadRes;
            }
          }

          const newMsg = await chatService.sendMessage({
            conversationId: activeConversationId,
            content: content || "",
            messageType: type,
            metadata: metadata.length ? metadata : undefined,
            parentMessageId: parentMessageId, // Pass parentId
          });

          get().receiveSocketMessage({
            domain: DomainTypes.MESSAGE,
            type: EventTypes.NEW_MESSAGE,
            data: newMsg,
          });
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
          toast.error("Bạn chưa xác thực người dùng");
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

        // 2. Gọi API
        try {
          await chatService.addReaction(messageId, reaction);
          // API thành công -> Không cần làm gì thêm vì UI đã update
        } catch (error) {
          console.error("Add reaction failed", error);
          toast.error("Thả cảm xúc thất bại");
          // Revert lại state cũ nếu lỗi
          set({ messages: originalMessages });
        }
      },

      removeReaction: async (messageId, reaction) => {
        const { currentUserId, messages } = get();
        if (!currentUserId) return;

        const originalMessages = [...messages];

        // 1. Optimistic Update
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

        // 2. Gọi API
        try {
          await chatService.removeReaction(messageId, reaction);
        } catch (error) {
          console.error("Remove reaction failed", error);
          toast.error("Xóa cảm xúc thất bại");
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
