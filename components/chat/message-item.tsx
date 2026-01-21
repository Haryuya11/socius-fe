"use client";

import { useState } from "react";
import { Message, MessageType } from "@/types/chat";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/use-chat-store";
import { formatMessageTime } from "@/utils/date-utils";
import { getFullImageUrl } from "@/utils/image-utils";
import { formatFileSize, isMediaFile } from "@/utils/file-utils";

import Image from "next/image";
import {
  FileIcon,
  PlayCircle,
  MoreVertical,
  Trash2,
  Edit2,
  Reply,
  SmilePlus,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { MediaViewer } from "./media-viewer";

// --- IMPORTS MỚI ---
import {
  CODE_TO_ICON,
  ICON_TO_CODE,
  DISPLAY_ICONS,
} from "@/constants/reaction-icons"; // Hãy đảm bảo đường dẫn đúng
import { ReactionBadge } from "./reaction-badge"; // Hãy đảm bảo đường dẫn đúng

export default function MessageItem({ message }: { message: Message }) {
  const {
    currentUserId,
    participants,
    deleteMessage,
    editMessage,
    setReplyingTo,
    messages,
    addReaction,
    removeReaction,
  } = useChatStore();

  const isMe = message.senderId === currentUserId;

  const senderInfo = participants.find(
    (p) => p.employeeId === message.senderId,
  );
  const senderName = senderInfo?.employeeDetails?.fullName || "Thành viên";
  const senderAvatar = getFullImageUrl(senderInfo?.employeeDetails?.avatarUrl);
  const senderInitials = senderName.charAt(0).toUpperCase();

  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: "image" | "video";
    name: string;
  } | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isReactionOpen, setIsReactionOpen] = useState(false);

  const isDeleted = message.content === "Tin nhắn đã bị thu hồi";

  const mediaFiles = isDeleted
    ? []
    : message.metadata?.filter((f) => isMediaFile(f.mimeType)) || [];
  const docFiles = isDeleted
    ? []
    : message.metadata?.filter((f) => !isMediaFile(f.mimeType)) || [];

  const parentMessage = message.parentMessageId
    ? messages.find((m) => m.messageId === message.parentMessageId)
    : null;

  // Tính toán số lượng reaction
  const reactionCounts = (message.reactions || []).reduce(
    (acc, curr) => {
      const icon = CODE_TO_ICON[curr.reaction] || curr.reaction;
      acc[icon] = (acc[icon] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

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

  const handleEditSave = async () => {
    if (editContent.trim() !== message.content) {
      await editMessage(message.messageId, editContent);
    }
    setIsEditing(false);
  };

  const handleReaction = async (icon: string) => {
    setIsReactionOpen(false);
    if (!currentUserId) return;

    const code = ICON_TO_CODE[icon];
    if (!code) return;

    const existing = message.reactions?.find(
      (r) => r.employeeId === currentUserId && r.reaction === code,
    );

    if (existing) {
      await removeReaction(message.messageId, code);
    } else {
      await addReaction(message.messageId, code);
    }
  };

  return (
    <>
      <div className={cn("flex flex-col gap-1 mb-2 w-full max-w-full")}>
        {/* REPLY CONTEXT */}
        {parentMessage && (
          <div
            className={cn(
              "flex items-center gap-2 text-xs text-muted-foreground mb-1 opacity-80 max-w-full",
              isMe ? "justify-end mr-2" : "justify-start ml-12",
            )}
          >
            <Reply className="h-3 w-3 scale-x-[-1] shrink-0" />
            <div className="bg-muted/30 px-2 py-0.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-1 max-w-[80%]">
              <span className="whitespace-nowrap shrink-0">
                Trả lời{" "}
                <strong>
                  {parentMessage.senderId === currentUserId ? "bạn" : "..."}
                </strong>
                :
              </span>
              <span className="italic truncate block min-w-0">
                {parentMessage.content || "[File đính kèm]"}
              </span>
            </div>
          </div>
        )}

        <div
          className={cn(
            "flex w-full gap-2 items-end",
            isMe ? "justify-end" : "justify-start",
          )}
        >
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
              "relative group flex flex-col gap-1 min-w-0 max-w-[75%]",
              isMe ? "items-end" : "items-start",
            )}
          >
            <div
              className={cn(
                "absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mb-2 z-50",
                isMe ? "right-full mr-2" : "left-full ml-2",
              )}
            >
              {!isDeleted && (
                <Popover open={isReactionOpen} onOpenChange={setIsReactionOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full bg-background border shadow-sm hover:bg-muted"
                    >
                      <SmilePlus className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-auto max-w-[340px] p-2 flex flex-wrap gap-1 bg-background border shadow-md rounded-xl"
                    align="center"
                    side="top"
                  >
                    {DISPLAY_ICONS.map((icon) => {
                      const code = ICON_TO_CODE[icon];
                      const isActive = message.reactions?.some(
                        (r) =>
                          r.employeeId === currentUserId && r.reaction === code,
                      );
                      return (
                        <button
                          key={icon}
                          onClick={() => handleReaction(icon)}
                          className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center text-xl transition-all duration-200 outline-none focus-visible:ring-2 ring-ring/50 relative",

                            "active:scale-90", 

                            !isActive && [
                              "hover:bg-muted hover:scale-110", 
                            ],

                            isActive && [
                              "z-10", 
                              "bg-blue-100 dark:bg-blue-900/50", 
                              "border-2 border-blue-400 dark:border-blue-500", 
                              "scale-110 shadow-sm", 
                              "hover:scale-125", 
                            ],
                          )}
                        >
                          {icon}
                        </button>
                      );
                    })}
                  </PopoverContent>
                </Popover>
              )}

              {!isDeleted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full bg-background border shadow-sm hover:bg-muted"
                  onClick={() => setReplyingTo(message)}
                  title="Trả lời"
                >
                  <Reply className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}

              {isMe && !isDeleted && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full bg-background border shadow-sm hover:bg-muted"
                    >
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isMe ? "end" : "start"}>
                    {message.messageType === MessageType.TEXT && (
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" /> Chỉnh sửa
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Thu hồi
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {!isMe && (
              <span className="text-[10px] text-muted-foreground ml-1 truncate max-w-full">
                {senderName}
              </span>
            )}

            {/* CONTENT RENDER */}
            {isEditing ? (
              <div className="flex flex-col gap-2 min-w-[200px] w-full max-w-full bg-background border rounded-xl p-2 shadow-sm z-20">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="h-8 text-sm w-full"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditSave();
                    if (e.key === "Escape") setIsEditing(false);
                  }}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => setIsEditing(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleEditSave}
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* 1. TEXT MESSAGE */}
                {message.content && (
                  <div
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm w-fit shadow-sm break-words whitespace-pre-wrap relative max-w-full",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted/50 border rounded-tl-none",
                      isDeleted &&
                        "bg-background border-2 border-dashed border-muted-foreground/30 text-muted-foreground italic shadow-none",
                    )}
                  >
                    <p>{message.content}</p>
                    {/* Reaction Badge (Imported) */}
                    {!isDeleted && (
                      <ReactionBadge
                        reactionCounts={reactionCounts}
                        isMe={isMe}
                      />
                    )}
                  </div>
                )}

                {/* 2. MEDIA (IMAGES/VIDEOS) */}
                {mediaFiles.length > 0 && (
                  <div className="relative w-fit">
                    <div
                      className={cn(
                        "grid gap-1 overflow-hidden rounded-xl w-full max-w-full",
                        mediaFiles.length === 1 ? "grid-cols-1" : "grid-cols-2",
                      )}
                    >
                      {mediaFiles.map((file, idx) => {
                        const isVideo = file.mimeType.startsWith("video/");
                        return (
                          <div
                            key={idx}
                            className="relative aspect-square min-w-[120px] bg-black/5"
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
                    {/* Reaction Badge cho Media */}
                    {!message.content && !isDeleted && (
                      <ReactionBadge
                        reactionCounts={reactionCounts}
                        isMe={isMe}
                      />
                    )}
                  </div>
                )}

                {/* 3. FILES (DOCS/PDF...) */}
                {docFiles.length > 0 &&
                  docFiles.map((file, idx) => {
                    const showReactionHere =
                      !message.content &&
                      mediaFiles.length === 0 &&
                      idx === docFiles.length - 1;

                    return (
                      <div key={idx} className="relative w-full max-w-xs mb-1">
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:bg-accent transition-colors w-full"
                        >
                          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                            <FileIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 overflow-hidden min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.fileName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatFileSize(file.fileSize)}
                            </p>
                          </div>
                        </a>
                        {showReactionHere && !isDeleted && (
                          <ReactionBadge
                            reactionCounts={reactionCounts}
                            isMe={isMe}
                          />
                        )}
                      </div>
                    );
                  })}
              </>
            )}

            <div className="flex items-center gap-2 px-1 mt-1">
              <span className="text-[10px] text-muted-foreground">
                {formatMessageTime(message.createdAt)}
                {message.isEdited && (
                  <span className="italic ml-1">đã sửa</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {selectedMedia && (
        <MediaViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          url={selectedMedia.url}
          type={selectedMedia.type}
          fileName={selectedMedia.name}
        />
      )}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Thu hồi tin nhắn?</AlertDialogTitle>
            <AlertDialogDescription>
              Tin nhắn này sẽ bị thu hồi khỏi cuộc trò chuyện đối với tất cả
              thành viên.
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
