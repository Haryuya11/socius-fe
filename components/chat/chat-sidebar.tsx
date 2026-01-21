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
import { Users, MessageSquare, PlusCircle } from "lucide-react";
import { MessageType, ConversationWithPreview } from "@/types/chat";
import { CreateGroupDialog } from "./create-group-dialog";
import { useState } from "react";
import { Button } from "../ui/button";

export default function ChatSidebar() {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const { conversations, currentUserId, markConversationAsRead } =
    useChatStore();
  const params = useParams();
  const currentId = params?.conversationId as string;

  const directConversations = conversations.filter((c) => c.type === "DIRECT");
  const groupConversations = conversations.filter((c) => c.type === "GROUP");

  const ConversationItem = ({ conv }: { conv: ConversationWithPreview }) => {
    const displayName = conv.name || "Cuộc trò chuyện";
    const displayAvatar = getFullImageUrl(conv.avatarUrl);
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
        {/* Avatar Area */}
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
          {/* Online Status Dot (Optional - future feature) */}
          {/* <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span> */}
        </div>

        {/* Content Area */}
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
                // Chưa đọc: Màu chính (đen/trắng) + Đậm. Đã đọc: Màu xám
                isUnread
                  ? "text-foreground font-bold"
                  : "text-muted-foreground",
                // Nếu là mình gửi: luôn nhạt
                !isUnread && isMe ? "text-muted-foreground/70" : "",
              )}
            >
              {isMe && "Bạn: "}
              {previewText.replace("Bạn: ", "")}
            </span>

            {/* Blue Dot for Unread */}
            {isUnread && (
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary animate-pulse" />
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Sidebar Header */}
      <div className="h-14 shrink-0 border-b flex items-center justify-between px-4">
        <span className="font-bold text-lg">Đoạn chat</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCreateGroupOpen(true)}
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {/* === SECTION: DIRECT MESSAGES === */}
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

          {/* === SECTION: GROUPS === */}
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

          {/* Empty State */}
          {conversations.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">
              Chưa có cuộc trò chuyện nào.
            </div>
          )}
        </div>
      </ScrollArea>
      <CreateGroupDialog
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
      />
    </div>
  );
}
