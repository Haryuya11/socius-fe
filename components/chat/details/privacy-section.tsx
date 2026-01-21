"use client";

import { Button } from "@/components/ui/button";
import { ShieldAlert, LogOut } from "lucide-react";
import { useChatStore } from "@/stores/use-chat-store";
import { chatService } from "@/services/chat-service";
import { toast } from "sonner";

interface PrivacySectionProps {
  onClose: () => void;
}

export function PrivacySection({ onClose }: PrivacySectionProps) {
  const { activeConversationId, conversations, loadConversations } =
    useChatStore();

  const currentConv = conversations.find(
    (c) => c.conversationId === activeConversationId,
  );
  const isGroup = currentConv?.type === "GROUP";

  const handleLeaveGroup = async () => {
    if (!activeConversationId) return;
    if (confirm("Bạn có chắc muốn rời nhóm này?")) {
      try {
        await chatService.leaveConversation(activeConversationId);
        toast.success("Đã rời nhóm");
        onClose();
        loadConversations(true);
      } catch {
        toast.error("Rời nhóm thất bại");
      }
    }
  };

  return (
    <div className="px-4 pb-4">
      <h3 className="font-semibold text-sm text-muted-foreground mb-2 px-2">
        Quyền riêng tư & Hỗ trợ
      </h3>
      <div className="space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
        >
          <ShieldAlert className="h-4 w-4 mr-3" />
          Báo cáo
        </Button>

        {isGroup && (
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
            onClick={handleLeaveGroup}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Rời khỏi nhóm
          </Button>
        )}
      </div>
    </div>
  );
}
