"use client";

import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/use-chat-store";
import { formatMessageTime } from "@/utils/date-utils";
import { getFullImageUrl } from "@/utils/image-utils";
import { formatFileSize, isMediaFile } from "@/utils/file-utils";

import Image from "next/image";
import { FileIcon, PlayCircle, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MediaViewer } from "./media-viewer";

const ActionMenu = ({ onDeleteClick }: { onDeleteClick: () => void }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full hover:bg-muted opacity-0 group-hover/block:opacity-100 transition-opacity"
      >
        <MoreVertical className="h-3 w-3 text-muted-foreground" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        onClick={onDeleteClick}
        className="text-destructive cursor-pointer"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Thu hồi tin nhắn
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// --- SUB COMPONENT: BLOCK WRAPPER ---
const MessageBlock = ({
  children,
  isMe,
  showMenu,
  onOpenDeleteDialog,
}: {
  children: React.ReactNode;
  isMe: boolean;
  showMenu: boolean;
  onOpenDeleteDialog: () => void;
}) => {
  return (
    <div
      className={cn(
        "group/block flex items-center gap-2 w-full",
        isMe ? "justify-end" : "justify-start",
      )}
    >
      {/* Menu bên trái nếu là Me */}
      {isMe && showMenu && <ActionMenu onDeleteClick={onOpenDeleteDialog} />}

      {/* Nội dung chính */}
      <div className={cn("max-w-full", isMe ? "order-2" : "order-1")}>
        {children}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function MessageItem({ message }: { message: Message }) {
  const { currentUserId, participants, deleteMessage } = useChatStore();
  const isMe = message.senderId === currentUserId;

  // ===== Sender Info =====
  const senderInfo = participants.find(
    (p) => p.employeeId === message.senderId,
  );
  const senderName = senderInfo?.employeeDetails?.fullName || "Thành viên";
  const senderAvatar = getFullImageUrl(senderInfo?.employeeDetails?.avatarUrl);
  const senderInitials = senderName.charAt(0).toUpperCase();

  // ===== State =====
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: "image" | "video";
    name: string;
  } | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isDeleted = message.content === "Tin nhắn đã bị thu hồi";
  const mediaFiles = isDeleted
    ? []
    : message.metadata?.filter((f) => isMediaFile(f.mimeType)) || [];

  const docFiles = isDeleted
    ? []
    : message.metadata?.filter((f) => !isMediaFile(f.mimeType)) || [];

  const handleMediaClick = (
    url: string,
    type: "image" | "video",
    name: string,
  ) => {
    setSelectedMedia({ url, type, name });
    setViewerOpen(true);
  };

  const confirmDelete = async () => {
    await deleteMessage(message.messageId);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "flex w-full gap-2 mb-2 items-end",
          isMe ? "justify-end" : "justify-start",
        )}
      >
        {/* Avatar (Others) */}
        {!isMe && (
          <Avatar className="h-8 w-8 shrink-0 mb-4 border">
            <AvatarImage src={senderAvatar} />
            <AvatarFallback className="text-[10px]">
              {senderInitials}
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={cn(
            "flex flex-col gap-1 min-w-0 max-w-[75%]",
            isMe ? "items-end" : "items-start",
          )}
        >
          {!isMe && (
            <span className="text-[10px] text-muted-foreground ml-1">
              {senderName}
            </span>
          )}

          {message.content && (
            <MessageBlock
              isMe={isMe}
              showMenu={!isDeleted}
              onOpenDeleteDialog={() => setIsDeleteDialogOpen(true)}
            >
              <div
                className={cn(
                  "rounded-xl px-4 py-2 text-sm w-fit shadow-sm wrap-break-word whitespace-pre-wrap",
                  isMe
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted/50 border rounded-tl-none",
                  isDeleted &&
                    "bg-background border-2 border-dashed border-muted-foreground/30 text-muted-foreground italic shadow-none",
                )}
              >
                <p>{message.content}</p>
              </div>
            </MessageBlock>
          )}

          {/* 2. MEDIA GROUP BLOCK */}
          {mediaFiles.length > 0 && (
            <MessageBlock
              isMe={isMe}
              showMenu={!isDeleted}
              onOpenDeleteDialog={() => setIsDeleteDialogOpen(true)}
            >
              <div
                className={cn(
                  "grid gap-1 overflow-hidden rounded-xl",
                  mediaFiles.length === 1 ? "grid-cols-1" : "grid-cols-2",
                )}
              >
                {mediaFiles.map((file, idx) => {
                  const isVideo = file.mimeType.startsWith("video/");
                  return (
                    <div
                      key={idx}
                      className="relative aspect-square min-w-[150px] bg-black/5"
                    >
                      {isVideo ? (
                        <div
                          className="w-full h-full relative group/media cursor-pointer"
                          onClick={() =>
                            handleMediaClick(
                              file.fileUrl,
                              "video",
                              file.fileName,
                            )
                          }
                        >
                          <video
                            src={file.fileUrl}
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/media:bg-black/30 transition-colors">
                            <PlayCircle className="w-10 h-10 text-white opacity-80" />
                          </div>
                        </div>
                      ) : (
                        <div
                          className="w-full h-full relative cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() =>
                            handleMediaClick(
                              file.fileUrl,
                              "image",
                              file.fileName,
                            )
                          }
                        >
                          <Image
                            src={file.fileUrl}
                            alt={file.fileName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </MessageBlock>
          )}

          {/* 3. FILES BLOCK LIST */}
          {docFiles.length > 0 &&
            docFiles.map((file, idx) => (
              <MessageBlock
                key={idx}
                isMe={isMe}
                showMenu={!isDeleted}
                onOpenDeleteDialog={() => setIsDeleteDialogOpen(true)}
              >
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:bg-accent transition-colors max-w-xs"
                >
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <FileIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {file.fileName}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatFileSize(file.fileSize)}
                    </p>
                  </div>
                </a>
              </MessageBlock>
            ))}

          {/* Timestamp & Reactions */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] text-muted-foreground">
              {formatMessageTime(message.createdAt)}
              {message.isEdited && <span className="italic ml-1">đã sửa</span>}
            </span>

            {message.reactions && message.reactions.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {message.reactions.map((reaction, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-muted/50 rounded-full px-2 py-0.5"
                  >
                    {reaction.reaction}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- UI COMPONENTS --- */}

      {/* 1. Media Lightbox */}
      {selectedMedia && (
        <MediaViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          url={selectedMedia.url}
          type={selectedMedia.type}
          fileName={selectedMedia.name}
        />
      )}

      {/* 2. Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thu hồi tin nhắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Tin nhắn này sẽ bị thu hồi khỏi cuộc trò chuyện đối với tất cả
              thành viên. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Thu hồi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
