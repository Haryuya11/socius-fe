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

// ... (Interface ChatState giữ nguyên như cũ)
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

  // Thêm action helper để EmployeeTable có thể gọi cập nhật nhanh (Optional nhưng tốt)
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

      // === GIỮ NGUYÊN SOCKET LOGIC NHƯ CŨ, CHỈ CẦN LƯU Ý PHẦN NEW_MESSAGE ===
      receiveSocketMessage: (wsMsg) => {
        if (wsMsg.domain !== DomainTypes.MESSAGE) return;
        const { activeConversationId, conversations, messages } = get();
        const rawData = wsMsg.data;
        const messageSource = rawData.message || rawData;

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

            // --- [SỬA ĐOẠN NÀY] ---
            // 1. Tìm conversation cũ (nếu có) để lấy unreadCount
            const existingConv = conversations.find(
              (c) => c.conversationId === payload.conversationId,
            );
            const newUnreadCount = isActive
              ? 0
              : (existingConv?.unreadCount || 0) + 1;

            // 2. Tạo object mới
            const newConvData: ConversationWithPreview = {
              ...(existingConv || {}), // Kế thừa dữ liệu cũ nếu có
              conversationId: payload.conversationId, // Đảm bảo ID luôn đúng
              // Nếu là hội thoại mới hoàn toàn thì fallback các trường
              type: existingConv?.type || (ConversationType.DIRECT as any),
              name: existingConv?.name || "Tin nhắn mới",
              avatarUrl: existingConv?.avatarUrl || "",
              createdBy: existingConv?.createdBy || "",
              createdAt: existingConv?.createdAt || payload.createdAt,

              // Cập nhật thông tin mới nhất
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

            // 3. Lọc bỏ HOÀN TOÀN conversation cũ khỏi danh sách (tránh duplicate)
            const otherConversations = conversations.filter(
              (c) => c.conversationId !== payload.conversationId,
            );

            // 4. Đưa conversation mới lên đầu
            const updatedConversations = [newConvData, ...otherConversations];

            // ... (phần xử lý messages giữ nguyên)
            let updatedMessages = messages;
            if (isActive) {
              // De-duplicate messages
              if (!messages.some((m) => m.messageId === payload.messageId)) {
                updatedMessages = [payload, ...messages];
              }
            }

            set({
              conversations: updatedConversations,
              messages: updatedMessages,
            });
            break;
            // ---------------------
          }
          // ... Các case khác (MESSAGE_UPDATED, DELETED, REACTION) giữ nguyên
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
            const reactionData = wsMsg.data;
            set({
              messages: messages.map((m) => {
                if (m.messageId === reactionData.messageId) {
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

      loadConversations: async (isRefresh = false) => {
        // ... (Giữ nguyên logic cũ của loadConversations)
        // Copy lại toàn bộ logic cũ của bạn ở đây để đảm bảo không mất
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

          // Fetch message details logic (Giữ nguyên)
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

      // === [FIX 1: SEARCH LOGIC] ===
      searchConversations: async (keyword) => {
        if (!keyword.trim()) {
          set({ searchResults: [], isSearching: false });
          return;
        }

        set({ isSearching: true });
        try {
          const rawData = await chatService.searchConversations(keyword);
          const currentConversations = get().conversations; // Lấy danh sách hiện tại

          const mappedResults: ConversationWithPreview[] = rawData.map(
            (conv: any) => {
              // 1. Kiểm tra xem kết quả search có trong list hiện tại không
              const existingConv = currentConversations.find(
                (c) => c.conversationId === conv.conversationId,
              );

              // 2. Nếu có, dùng existingConv để giữ lại lastMessageContent và preview
              if (existingConv) {
                return existingConv;
              }

              // 3. Nếu không, map dữ liệu mới từ search (chấp nhận chưa có preview)
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
                lastMessageContent: "", // API search chưa trả về cái này
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
          // Check duplicate
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

      // === [FIX 2: SELECT CONVERSATION - XỬ LÝ NEW CHAT] ===
      selectConversation: async (id) => {
        // Reset state trước
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
          // 1. Kiểm tra xem conversation có trong store chưa
          const existingConv = get().conversations.find(
            (c) => c.conversationId === id,
          );

          // 2. Nếu CHƯA CÓ (vừa tạo mới, hoặc truy cập qua URL), phải fetch detail
          if (!existingConv) {
            const detail = await chatService.getConversationDetail(id);
            if (detail) {
              const newConvPreview: ConversationWithPreview = {
                conversationId: detail.conversationId,
                type: detail.type,
                name: detail.name || "Cuộc trò chuyện",
                avatarUrl: detail.avatarUrl,
                createdBy: detail.createdBy,
                lastMessageId: detail.lastMessageId,
                lastMessageAt: detail.lastMessageAt,
                createdAt: detail.createdAt,
                lastMessageContent: "",
                lastMessageType: MessageType.TEXT,
                lastSenderId: "",
                unreadCount: 0,
              };
              // Thêm vào đầu danh sách
              set((state) => ({
                conversations: [newConvPreview, ...state.conversations],
              }));
            }
          }

          // 3. Fetch messages và participants như bình thường
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

          // Mark read tin nhắn mới nhất
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

      // ... (Các actions markConversationAsRead, loadMoreMessages, sendMessage, editMessage, deleteMessage, addReaction, removeReaction giữ nguyên)
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
