// components/chat/create-group-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { chatService } from "@/services/chat-service";
import { useChatStore } from "@/stores/use-chat-store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { MultiEmployeeSelector } from "../common/multi-employee-selector";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
}: CreateGroupDialogProps) {
  const [name, setName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUserId, loadConversations } = useChatStore();

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Vui lòng nhập tên nhóm");
    if (memberIds.length === 0) return toast.error("Vui lòng chọn thành viên");

    setIsLoading(true);
    try {
      // API yêu cầu participantIds bao gồm cả người tạo
      const finalIds = currentUserId
        ? [...new Set([...memberIds, currentUserId])]
        : memberIds;

      await chatService.createGroupConversation(name, finalIds);
      toast.success("Tạo nhóm thành công");
      onOpenChange(false);

      // Reload list để hiện group mới
      loadConversations(true);

      // Reset form
      setName("");
      setMemberIds([]);
    } catch (error) {
      console.error(error);
      toast.error("Tạo nhóm thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo nhóm mới</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tên nhóm</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên nhóm..."
            />
          </div>
          <div className="grid gap-2">
            <Label>Thành viên</Label>
            <MultiEmployeeSelector value={memberIds} onChange={setMemberIds} />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={isLoading || !name || memberIds.length === 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo nhóm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
