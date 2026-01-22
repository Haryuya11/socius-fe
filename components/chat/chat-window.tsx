"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useChatStore } from "@/stores/use-chat-store";
import { MessageType } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Send,
  Paperclip,
  X,
  File as FileIcon,
  Info,
  ArrowDown,
  Reply,
  Image as ImageIcon,
} from "lucide-react";
import MessageItem from "./message-item";
import { useDropzone } from "react-dropzone";
import { ChatDetails } from "./chat-details";
import { useInView } from "react-intersection-observer";
import { getFullImageUrl } from "@/utils/image-utils";
import { formatFileSize } from "@/utils/file-utils";

export default function ChatWindow() {
  const {
    activeConversationId,
    messages,
    isLoadingMessages,
    sendMessage,
    loadMoreMessages,
    hasMoreMessages,
    conversations,
    replyingTo,
    setReplyingTo,
  } = useChatStore();

  const [inputText, setInputText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalSize = useMemo(() => {
    return selectedFiles.reduce((acc, file) => acc + file.size, 0);
  }, [selectedFiles]);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px 0px 0px 0px",
  });

  const currentConversation = conversations.find(
    (c) => c.conversationId === activeConversationId,
  );

  useEffect(() => {
    if (inView && hasMoreMessages && !isLoadingMessages) {
      const timer = setTimeout(() => {
        loadMoreMessages();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [inView, hasMoreMessages, isLoadingMessages, loadMoreMessages]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop } = scrollContainerRef.current;
    const isFarFromBottom = Math.abs(scrollTop) > 300;
    setShowScrollBottom(isFarFromBottom);
  };

  const handleScrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      setShowScrollBottom(false);
    }
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text, MessageType.TEXT, []);
  };

  const renderEmptyState = () => {
    if (!currentConversation) return null;

    const isGroup = currentConversation.type === "GROUP";

    const imageType = isGroup ? "conversation" : "user";
    const avatarUrl = getFullImageUrl(currentConversation.avatarUrl, imageType);

    const name = currentConversation.name || "Người dùng";
    const initials = name.charAt(0).toUpperCase();

    const config = isGroup
      ? {
          description:
            "Nhóm mới đã được tạo. Hãy bắt đầu thảo luận cùng các thành viên!",
          suggestions: [
            "Chào mọi người 👋",
            "Mọi người điểm danh nhé!",
            "Chúng ta bắt đầu được chưa?",
            "Gửi tài liệu lên giúp mình.",
          ],
        }
      : {
          description: "Hai bạn đã được kết nối trên Socius. Hãy gửi lời chào!",
          suggestions: [
            "Xin chào 👋",
            "Bạn có rảnh không?",
            "Mình cần trao đổi chút việc.",
            "Cảm ơn bạn nhé!",
          ],
        };

    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="relative mb-4">
          <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
            <AvatarImage src={avatarUrl} className="object-cover" />
            <AvatarFallback className="text-4xl bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-1 max-w-[80%] truncate">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground mb-8 max-w-[320px]">
          {config.description}
        </p>

        <div className="grid grid-cols-2 gap-2 w-full max-w-[450px]">
          {config.suggestions.map((text, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-3 px-4 justify-start text-left whitespace-normal hover:border-primary/50 hover:bg-primary/5 transition-all"
              onClick={() => handleQuickReply(text)}
            >
              <span className="truncate">{text}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!inputText.trim() && selectedFiles.length === 0) || isSending) return;

    setIsSending(true);

    try {
      const content = inputText;
      const files = selectedFiles;
      const parentId = replyingTo?.messageId;

      setInputText("");
      setSelectedFiles([]);
      setReplyingTo(null);
      handleScrollToBottom();

      await sendMessage(content, MessageType.TEXT, files, parentId);
    } catch (error) {
      console.error("Gửi thất bại", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!activeConversationId && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayTitle = currentConversation?.name || "Cuộc trò chuyện";

  return (
    <div
      {...getRootProps()}
      className="flex flex-col h-full w-full relative overflow-hidden bg-background"
    >
      {isDragActive && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-primary m-4 rounded-xl">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <Paperclip className="h-10 w-10 text-primary" />
            <p className="font-semibold text-lg text-primary">
              Thả file vào đây để gửi
            </p>
          </div>
        </div>
      )}

      <input {...getInputProps()} className="hidden" />

      {/* HEADER */}
      <div className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-card/50 backdrop-blur z-10">
        <h3 className="font-semibold truncate max-w-60">{displayTitle}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDetailsOpen(true)}
        >
          <Info className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      {/* BODY */}
      <div className="flex-1 min-h-0 relative group">
        {messages.length > 0 ? (
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto overflow-x-hidden p-4 scroll-smooth-disable flex flex-col-reverse gap-4"
            style={{ overflowAnchor: "none" }}
          >
            {messages.map((msg) => (
              <div key={msg.messageId} className="shrink-0">
                <MessageItem message={msg} />
              </div>
            ))}

            <div className="h-10 w-full shrink-0 flex items-center justify-center py-2">
              {hasMoreMessages ? (
                <div
                  ref={loadMoreRef}
                  className="flex items-center justify-center w-full h-full"
                >
                  {isLoadingMessages && (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                </div>
              ) : (
                messages.length > 10 && (
                  <span className="text-xs text-muted-foreground">
                    Đã hiển thị toàn bộ tin nhắn
                  </span>
                )
              )}
            </div>
          </div>
        ) : isLoadingMessages ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">
                Đang tải tin nhắn...
              </p>
            </div>
          </div>
        ) : (
          renderEmptyState()
        )}

        {showScrollBottom && (
          <Button
            size="icon"
            className="absolute bottom-4 right-4 rounded-full h-10 w-10 shadow-lg animate-in zoom-in duration-200 bg-primary/90 hover:bg-primary z-20"
            onClick={handleScrollToBottom}
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* FOOTER */}
      <div className="border-t shrink-0 bg-background">
        {/* REPLY BANNER */}
        {replyingTo && (
          <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-l-4 border-l-primary animate-in slide-in-from-bottom-2">
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <Reply className="h-3 w-3" /> Đang trả lời
              </span>
              <span className="text-sm truncate text-muted-foreground max-w-[300px]">
                {replyingTo.content || "File đính kèm"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setReplyingTo(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="flex flex-col bg-muted/30 border-b">
            <div className="px-4 py-1 flex justify-between items-center text-[10px] text-muted-foreground bg-muted/50 border-b border-border/50">
              <span>Đã chọn {selectedFiles.length} file</span>
              <span className="font-medium">
                Tổng: {formatFileSize(totalSize)}
              </span>
            </div>

            <div className="flex gap-3 px-4 py-3 overflow-x-auto">
              {selectedFiles.map((file, idx) => {
                const isImage = file.type.startsWith("image/");
                const previewUrl = URL.createObjectURL(file);

                return (
                  <div
                    key={idx}
                    className="relative group shrink-0 w-24 h-24 rounded-lg border bg-background overflow-hidden flex flex-col shadow-sm"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="absolute top-1 right-1 z-10 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>

                    <div className="flex-1 relative w-full overflow-hidden bg-checkerboard">
                      {isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <FileIcon className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate text-center backdrop-blur-[1px]">
                        {formatFileSize(file.size)}
                      </div>
                    </div>

                    {!isImage && (
                      <div className="h-6 px-1 flex items-center justify-center bg-card border-t">
                        <span
                          className="text-[9px] truncate w-full text-center"
                          title={file.name}
                        >
                          {file.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-4 flex items-end gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => document.getElementById("manual-upload")?.click()}
            title="Đính kèm file"
            disabled={isSending}
          >
            <Paperclip className="h-5 w-5" />
            <input
              id="manual-upload"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) onDrop(Array.from(e.target.files));
              }}
            />
          </Button>

          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={isSending ? "Đang gửi..." : "Nhập tin nhắn..."}
            className="flex-1 min-h-10"
            disabled={isSending}
          />

          <Button
            size="icon"
            onClick={handleSend}
            disabled={
              (!inputText.trim() && selectedFiles.length === 0) || isSending
            }
            className={isSending ? "cursor-not-allowed opacity-80" : ""}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <ChatDetails open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
    </div>
  );
}
