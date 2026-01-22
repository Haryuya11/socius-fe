"use client";

import { useChatStore } from "@/stores/use-chat-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatRelativeTime } from "@/utils/date-utils";
import { getMessagePreview } from "@/utils/chat-utils";
import { getFullImageUrl } from "@/utils/image-utils";
import { Users, MessageSquare, PlusCircle, Search, X } from "lucide-react";
import { MessageType, ConversationWithPreview } from "@/types/chat";
import { CreateGroupDialog } from "./create-group-dialog";
import { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function ChatSidebar() {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  const {
    conversations,
    searchResults,
    isSearching,
    searchConversations,
    clearSearch,
    currentUserId,
    markConversationAsRead,
  } = useChatStore();

  const params = useParams();
  const currentId = params?.conversationId as string;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword.trim()) {
        searchConversations(keyword);
      } else {
        clearSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, searchConversations, clearSearch]);

  const displayConversations = useMemo(() => {
    const sourceList = keyword.trim() ? searchResults : conversations;
    const uniqueMap = new Map();
    sourceList.forEach((conv) => {
      if (!uniqueMap.has(conv.conversationId)) {
        uniqueMap.set(conv.conversationId, conv);
      }
    });
    return Array.from(uniqueMap.values());
  }, [keyword, searchResults, conversations]);

  const directConversations = displayConversations.filter(
    (c) => c.type === "DIRECT",
  );
  const groupConversations = displayConversations.filter(
    (c) => c.type === "GROUP",
  );

  const ConversationItem = ({ conv }: { conv: ConversationWithPreview }) => {
    const displayName = conv.name || "Cuộc trò chuyện";

    const imageType = conv.type === "GROUP" ? "conversation" : "user";
    const displayAvatar = getFullImageUrl(conv.avatarUrl, imageType);

    const initial = displayName.charAt(0).toUpperCase();

    const isMe = conv.lastSenderId === currentUserId;
    const isUnread = (conv.unreadCount || 0) > 0;
    const isActive = currentId === conv.conversationId;

    const previewText = conv.lastMessageContent
      ? getMessagePreview(
          conv.lastMessageContent,
          conv.lastMessageType || MessageType.TEXT,
          isMe,
          "",
        )
      : conv.lastMessageId
        ? "Tin nhắn mới"
        : "Bắt đầu cuộc trò chuyện";

    return (
      <Link
        key={conv.conversationId}
        href={`/chat/${conv.conversationId}`}
        onClick={() => {
          if (isUnread) markConversationAsRead(conv.conversationId);
        }}
        className={cn(
          "flex items-center gap-3 rounded-lg p-3 text-left transition-all hover:bg-accent group relative",
          isActive ? "bg-accent" : "bg-transparent",
        )}
      >
        <div className="relative shrink-0">
          <Avatar className="h-12 w-12 border shadow-sm">
            <AvatarImage src={displayAvatar} />
            <AvatarFallback
              className={cn(
                "text-sm font-semibold",
                conv.type === "GROUP"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-blue-100 text-blue-700",
              )}
            >
              {conv.type === "GROUP" ? (
                <Users className="h-5 w-5 opacity-70" />
              ) : (
                initial
              )}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col overflow-hidden w-full gap-1">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "truncate text-sm pr-2",
                isUnread
                  ? "font-bold text-foreground"
                  : "font-medium text-foreground/90",
              )}
            >
              {displayName}
            </span>
            {conv.lastMessageAt && (
              <span
                className={cn(
                  "text-[10px] shrink-0",
                  isUnread ? "font-bold text-primary" : "text-muted-foreground",
                )}
              >
                {formatRelativeTime(conv.lastMessageAt)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "text-xs truncate h-4 block max-w-[180px]",
                isUnread
                  ? "text-foreground font-bold"
                  : "text-muted-foreground",
                !isUnread && isMe ? "text-muted-foreground/70" : "",
              )}
            >
              {isMe && "Bạn: "}
              {previewText.replace("Bạn: ", "")}
            </span>
            {isUnread && (
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary animate-pulse" />
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background border-r overflow-hidden">
      <div className="flex flex-col border-b px-4 py-3 gap-3 shrink-0 bg-background z-10">
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">Đoạn chat</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCreateGroupOpen(true)}
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            className="pl-9 h-9 bg-muted/50"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          {keyword && (
            <button
              onClick={() => {
                setKeyword("");
                clearSearch();
              }}
              className="absolute right-2.5 top-2.5 hover:text-foreground text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full w-full">
          <div className="flex flex-col gap-1 p-2 pb-4">
            {keyword && isSearching && (
              <div className="text-center py-4 text-xs text-muted-foreground">
                Đang tìm kiếm...
              </div>
            )}

            {keyword && !isSearching && displayConversations.length === 0 && (
              <div className="text-center py-4 text-xs text-muted-foreground">
                Không tìm thấy kết quả.
              </div>
            )}

            {directConversations.length > 0 && (
              <div className="mb-4">
                <h4 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" /> Tin nhắn riêng
                </h4>
                {directConversations.map((conv) => (
                  <ConversationItem key={conv.conversationId} conv={conv} />
                ))}
              </div>
            )}

            {groupConversations.length > 0 && (
              <div className="mb-2">
                <h4 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-3 w-3" /> Nhóm
                </h4>
                {groupConversations.map((conv) => (
                  <ConversationItem key={conv.conversationId} conv={conv} />
                ))}
              </div>
            )}

            {!keyword && conversations.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">
                Chưa có cuộc trò chuyện nào.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <CreateGroupDialog
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
      />
    </div>
  );
}
