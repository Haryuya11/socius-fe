/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getFullImageUrl } from "@/utils/image-utils";
import { Search, Bell, UserPlus } from "lucide-react";
import { ConversationWithPreview } from "@/types/chat";

interface ChatHeaderProps {
  conversation: ConversationWithPreview;
  isGroup: boolean;
  onAddMember?: () => void;
}

const QuickAction = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick?: () => void;
}) => (
  <div className="flex flex-col items-center gap-2">
    <Button
      variant="secondary"
      size="icon"
      className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80"
      onClick={onClick}
    >
      <Icon className="h-5 w-5 text-foreground" />
    </Button>
    <span className="text-[11px] text-muted-foreground font-medium">
      {label}
    </span>
  </div>
);

export function ChatHeader({ conversation, isGroup, onAddMember }: ChatHeaderProps) {
  return (
    <div className="flex flex-col items-center pt-8 pb-6 px-4">
      <Avatar className="h-24 w-24 border-2 border-background shadow-lg mb-3">
        <AvatarImage src={getFullImageUrl(conversation.avatarUrl)} />
        <AvatarFallback className="text-3xl bg-primary/10 text-primary">
          {conversation.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <h2 className="text-xl font-bold text-center px-4 leading-tight">
        {conversation.name || "Cuộc trò chuyện"}
      </h2>
      <p className="text-sm text-muted-foreground mt-1">
        {isGroup ? "Nhóm trò chuyện" : "Tin nhắn trực tiếp"}
      </p>

      {/* QUICK ACTIONS */}
      <div className="flex justify-center gap-6 mt-6">
        {isGroup && (
          <QuickAction
            icon={UserPlus}
            label="Thêm người"
            onClick={onAddMember}
          />
        )}
      </div>
    </div>
  );
}