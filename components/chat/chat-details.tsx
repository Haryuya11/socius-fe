/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChatStore } from "@/stores/use-chat-store";
import { chatService } from "@/services/chat-service";
import { getFullImageUrl } from "@/utils/image-utils";
import { isMediaFile } from "@/utils/file-utils";
import {
  Trash2,
  UserPlus,
  LogOut,
  Bell,
  Search,
  Image as ImageIcon,
  FileText,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MultiEmployeeSelector } from "@/components/common/multi-employee-selector";
import Image from "next/image";

interface QuickActionProps {
  icon: any;
  label: string;
  onClick?: () => void;
}

const QuickAction = ({ icon: Icon, label, onClick }: QuickActionProps) => (
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
// ------------------------------------------

interface ChatDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDetails({ open, onOpenChange }: ChatDetailsProps) {
  const {
    activeConversationId,
    conversations,
    participants,
    currentUserId,
    messages,
    selectConversation,
    loadConversations,
  } = useChatStore();

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberIds, setNewMemberIds] = useState<string[]>([]);

  const currentConv = conversations.find(
    (c) => c.conversationId === activeConversationId,
  );

  const latestMedia = useMemo(() => {
    const media: { url: string; id: string }[] = [];
    for (const msg of messages) {
      if (msg.metadata && msg.metadata.length > 0) {
        for (const meta of msg.metadata) {
          if (isMediaFile(meta.mimeType)) {
            media.push({ url: meta.fileUrl, id: meta.fileUrl });
            if (media.length >= 4) return media;
          }
        }
      }
    }
    return media;
  }, [messages]);

  if (!currentConv) return null;

  const isGroup = currentConv.type === "GROUP";
  const isAdmin = participants.some(
    (p) => p.employeeId === currentUserId && p.role === "ADMIN",
  );

  // --- ACTIONS ---
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

  const handleLeaveGroup = async () => {
    if (!activeConversationId) return;
    if (confirm("Bạn có chắc muốn rời nhóm này?")) {
      try {
        await chatService.leaveConversation(activeConversationId);
        toast.success("Đã rời nhóm");
        onOpenChange(false);
        loadConversations(true);
      } catch {
        toast.error("Rời nhóm thất bại");
      }
    }
  };

  // --- Đã xóa QuickAction khỏi đây ---

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[450px] p-0 flex flex-col gap-0 bg-background">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle>Thông tin hội thoại</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 w-full">
          <div className="flex flex-col pb-6">
            {/* 1. HEADER INFO */}
            <div className="flex flex-col items-center pt-8 pb-6 px-4">
              <Avatar className="h-24 w-24 border-2 border-background shadow-lg mb-3">
                <AvatarImage src={getFullImageUrl(currentConv.avatarUrl)} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {currentConv.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-center px-4 leading-tight">
                {currentConv.name || "Cuộc trò chuyện"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isGroup ? "Nhóm trò chuyện" : "Tin nhắn trực tiếp"}
              </p>
            </div>

            {/* 2. QUICK ACTIONS */}
            <div className="flex justify-center gap-6 mb-6">
              <QuickAction icon={Search} label="Tìm kiếm" />
              <QuickAction icon={Bell} label="Tắt thông báo" />
              {isGroup && (
                <QuickAction
                  icon={UserPlus}
                  label="Thêm người"
                  onClick={() => setIsAddMemberOpen(true)}
                />
              )}
            </div>

            <Separator className="mb-4" />

            {/* 3. MEDIA PREVIEW */}
            <div className="px-4 mb-6">
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  File phương tiện & file
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-primary hover:bg-transparent"
                >
                  Xem tất cả
                </Button>
              </div>

              {latestMedia.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {latestMedia.map((media, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-md overflow-hidden bg-muted border"
                    >
                      <Image
                        src={media.url}
                        alt="media"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-muted/30 rounded-lg border border-dashed">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Chưa có ảnh/video nào
                  </p>
                </div>
              )}

              {/* File list button fake */}
              <div className="mt-2 flex flex-col gap-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start font-normal text-sm h-10 px-2"
                >
                  <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
                  File tài liệu
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/50" />
                </Button>
              </div>
            </div>

            <Separator className="mb-4" />

            {/* 4. MEMBER LIST */}
            <div className="px-4 mb-6">
              <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  Thành viên nhóm
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
                    />
                  </div>
                  <Button onClick={handleAddMembers}>Xác nhận</Button>
                </DialogContent>
              </Dialog>

              <div className="space-y-1 mt-2">
                {participants.map((p) => {
                  const empName = p.employeeDetails?.fullName || "Người dùng";
                  const empAvatar = getFullImageUrl(
                    p.employeeDetails?.avatarUrl,
                  );
                  const isUserMe = p.employeeId === currentUserId;
                  const isRowAdmin = p.role === "ADMIN";

                  return (
                    <div
                      key={p.employeeId}
                      className="group flex items-center justify-between p-2 hover:bg-accent/50 rounded-lg transition-colors cursor-default"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={empAvatar} />
                          <AvatarFallback>{empName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-medium truncate">
                            {empName}{" "}
                            {isUserMe && (
                              <span className="text-muted-foreground font-normal">
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

                      {/* Nút Xóa: Chỉ hiện khi hover + quyền Admin */}
                      {isGroup && isAdmin && !isUserMe && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveMember(p.employeeId)}
                          title="Xóa khỏi nhóm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Nút thêm thành viên ở dưới list */}
              {isGroup && (
                <Button
                  variant="outline"
                  className="w-full mt-3 dashed border-muted-foreground/30 text-muted-foreground"
                  onClick={() => setIsAddMemberOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" /> Thêm thành viên
                </Button>
              )}
            </div>

            <Separator className="mb-4" />

            {/* 5. PRIVACY & SUPPORT */}
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
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
