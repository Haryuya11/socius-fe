/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { getFullImageUrl } from "@/utils/image-utils";
import { UserPlus, User, Camera, Pencil, Check, X } from "lucide-react"; 
import { ConversationWithPreview } from "@/types/chat";
import { useChatStore } from "@/stores/use-chat-store";
import { useRouter } from "next/navigation";
import { GroupAvatarUploadDialog } from "./group-avatar-upload-dialog";
import { chatService } from "@/services/chat-service"; 
import { toast } from "sonner"; 

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

const AvatarWrapper = ({
  children,
  isGroup,
  conversationId,
}: {
  children: React.ReactNode;
  isGroup: boolean;
  conversationId: string;
}) => {
  if (isGroup) {
    return (
      <GroupAvatarUploadDialog conversationId={conversationId}>
        <div className="relative group cursor-pointer">{children}</div>
      </GroupAvatarUploadDialog>
    );
  }
  return <div className="relative">{children}</div>;
};

export function ChatHeader({
  conversation,
  isGroup,
  onAddMember,
}: ChatHeaderProps) {
  const { participants, currentUserId, loadConversations, selectConversation } =
    useChatStore();
  const router = useRouter();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(conversation.name || "");
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    setEditedName(conversation.name || "");
  }, [conversation.name]);

  const partner = !isGroup
    ? participants.find((p) => p.employeeId !== currentUserId)
    : null;

  const handleUpdateName = async () => {
    if (!editedName.trim()) {
      toast.error("Tên nhóm không được để trống");
      return;
    }

    if (editedName === conversation.name) {
      setIsEditingName(false);
      return;
    }

    try {
      setIsSavingName(true);

      await chatService.updateConversation(conversation.conversationId, {
        name: editedName,
        avatarUrl: conversation.avatarUrl || "", 
      });

      await loadConversations(true);
      await selectConversation(conversation.conversationId);

      toast.success("Đổi tên nhóm thành công");
      setIsEditingName(false);
    } catch (error) {
      console.error(error);
      toast.error("Đổi tên thất bại");
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-8 pb-6 px-4">
      <AvatarWrapper
        isGroup={isGroup}
        conversationId={conversation.conversationId}
      >
        <Avatar className="h-24 w-24 border-2 border-background shadow-lg mb-3 transition-transform duration-300 group-hover:scale-105">
          <AvatarImage
            src={getFullImageUrl(conversation.avatarUrl, "conversation")}
            className="object-cover"
          />
          <AvatarFallback className="text-3xl bg-primary/10 text-primary">
            {conversation.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {isGroup && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-2 border-transparent z-20 mb-3">
            <Camera className="h-8 w-8 text-white drop-shadow-md" />
          </div>
        )}
      </AvatarWrapper>

      {isGroup && isEditingName ? (
        <div className="flex items-center gap-2 mt-1 mb-1 w-full justify-center animate-in fade-in zoom-in duration-200">
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="h-8 text-center font-bold text-lg w-[180px]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdateName();
              if (e.key === "Escape") {
                setEditedName(conversation.name || "");
                setIsEditingName(false);
              }
            }}
            disabled={isSavingName}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
            onClick={handleUpdateName}
            disabled={isSavingName}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={() => {
              setEditedName(conversation.name || "");
              setIsEditingName(false);
            }}
            disabled={isSavingName}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`relative group flex items-center justify-center gap-2 px-2 py-1 rounded-md transition-all ${
            isGroup ? "cursor-pointer hover:bg-muted/50" : ""
          }`}
          onClick={() => isGroup && setIsEditingName(true)}
          title={isGroup ? "Bấm để đổi tên" : undefined}
        >
          <h2 className="text-xl font-bold text-center leading-tight truncate max-w-[250px]">
            {conversation.name || "Cuộc trò chuyện"}
          </h2>
          {isGroup && (
            <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      )}

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

        {!isGroup && partner && (
          <QuickAction
            icon={User}
            label="Xem hồ sơ"
            onClick={() => router.push(`/employees/${partner.employeeId}`)}
          />
        )}
      </div>
    </div>
  );
}
