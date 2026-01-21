/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useMemo } from "react";
import { useChatStore } from "@/stores/use-chat-store";
import { getFullImageUrl } from "@/utils/image-utils";
import { chatService } from "@/services/chat-service";
import { Trash2, UserPlus, MoreHorizontal, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MultiEmployeeSelector } from "@/components/common/multi-employee-selector";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

interface MemberSectionProps {
  isAddMemberOpen: boolean;
  setIsAddMemberOpen: (open: boolean) => void;
}

export function MemberSection({
  isAddMemberOpen,
  setIsAddMemberOpen,
}: MemberSectionProps) {
  const {
    activeConversationId,
    participants,
    currentUserId,
    conversations,
    selectConversation,
  } = useChatStore();

  const router = useRouter();

  const [newMemberIds, setNewMemberIds] = useState<string[]>([]);

  const currentConv = conversations.find(
    (c) => c.conversationId === activeConversationId,
  );
  const isGroup = currentConv?.type === "GROUP";
  const isAdmin = participants.some(
    (p) => p.employeeId === currentUserId && p.role === "ADMIN",
  );

  const existingParticipantIds = useMemo(() => {
    return participants.map((p) => p.employeeId);
  }, [participants]);

  const handleAddMembers = async () => {
    if (newMemberIds.length === 0 || !activeConversationId) return;
    try {
      const payload = newMemberIds.map((id) => ({
        employeeId: id,
        role: "MEMBER",
      }));
      await chatService.addParticipants(activeConversationId, payload);
      toast.success("Đã thêm thành viên");
      setIsAddMemberOpen(false);
      setNewMemberIds([]);
      selectConversation(activeConversationId);
    } catch (error) {
      toast.error("Thêm thành viên thất bại");
    }
  };

  const handleRemoveMember = async (employeeId: string) => {
    if (!activeConversationId) return;
    try {
      await chatService.removeParticipants(activeConversationId, [employeeId]);
      toast.success("Đã xóa thành viên");
      selectConversation(activeConversationId);
    } catch {
      toast.error("Xóa thành viên thất bại");
    }
  };

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="font-semibold text-sm text-muted-foreground">
          Thành viên
        </h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {participants.length}
        </span>
      </div>

      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm thành viên</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <MultiEmployeeSelector
              value={newMemberIds}
              onChange={setNewMemberIds}
              excludeIds={existingParticipantIds}
            />
          </div>
          <Button onClick={handleAddMembers}>Xác nhận</Button>
        </DialogContent>
      </Dialog>

      <ScrollArea className="h-[250px] pr-3 -mr-3">
        <div className="space-y-1 mt-2">
          {participants.map((p) => {
            const empName = p.fullName || "Người dùng";
            const empAvatar = getFullImageUrl(p.imageUrl);

            const isUserMe = p.employeeId === currentUserId;
            const isRowAdmin = p.role === "ADMIN";

            const canRemove = isGroup && isAdmin && !isUserMe;

            return (
              <div
                key={p.employeeId}
                className="group flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg transition-colors cursor-default"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={empAvatar} />
                    <AvatarFallback>
                      {empName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-medium truncate">
                      {empName}
                      {isUserMe && (
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          (Bạn)
                        </span>
                      )}
                    </p>
                    {isRowAdmin && (
                      <span className="text-[10px] text-primary bg-primary/10 w-fit px-1.5 rounded font-medium mt-0.5">
                        Quản trị viên
                      </span>
                    )}
                  </div>
                </div>

                {!isUserMe && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/employees/${p.employeeId}`)
                        }
                        className="cursor-pointer"
                      >
                        <User className="h-4 w-4 mr-2" /> Xem hồ sơ
                      </DropdownMenuItem>

                      {canRemove && (
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(p.employeeId)}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Xóa khỏi nhóm
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {isGroup && isAdmin && (
        <Button
          variant="outline"
          className="w-full mt-3 dashed border-muted-foreground/30 text-muted-foreground"
          onClick={() => setIsAddMemberOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" /> Thêm thành viên
        </Button>
      )}
    </div>
  );
}
