"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
} from "lucide-react";
import MessageItem from "./message-item";
import { useDropzone } from "react-dropzone";
import { ChatDetails } from "./chat-details";
import { useInView } from "react-intersection-observer";
import { getFullImageUrl } from "@/utils/image-utils";

export default function ChatWindow() {
  const {
    activeConversationId,
    messages, // Store lưu: [Mới nhất, ..., Cũ nhất]
    isLoadingMessages,
    sendMessage,
    loadMoreMessages,
    hasMoreMessages,
    conversations,
  } = useChatStore();

  const [inputText, setInputText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // --- REFS ---
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Observer: Đặt ở visual TOP (tức là cuối DOM do flex-col-reverse)
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px 0px 0px 0px", // Trigger sớm khi cách đỉnh 100px
  });

  const currentConversation = conversations.find(
    (c) => c.conversationId === activeConversationId,
  );

  // --- LOGIC 1: LOAD MORE ---
  useEffect(() => {
    // Chỉ load khi thấy observer, còn tin cũ, và không đang loading
    if (inView && hasMoreMessages && !isLoadingMessages) {
      const timer = setTimeout(() => {
        loadMoreMessages();
      }, 200); // Debounce nhẹ
      return () => clearTimeout(timer);
    }
  }, [inView, hasMoreMessages, isLoadingMessages, loadMoreMessages]);

  // --- LOGIC 2: SCROLL BUTTON ---
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    // Trong flex-col-reverse, scrollTop = 0 nghĩa là ở Đáy.
    // Khi scroll lên (về quá khứ), scrollTop sẽ thay đổi (âm hoặc dương tùy trình duyệt)
    const { scrollTop } = scrollContainerRef.current;

    // Nếu cách đáy > 300px thì hiện nút
    const isFarFromBottom = Math.abs(scrollTop) > 300;
    setShowScrollBottom(isFarFromBottom);
  };

  const handleScrollToBottom = () => {
    if (scrollContainerRef.current) {
      // Scroll về 0 là về Đáy (tin mới nhất)
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      setShowScrollBottom(false);
    }
  };

  // --- LOGIC 3: QUICK REPLY & EMPTY STATE ---
  const handleQuickReply = (text: string) => {
    sendMessage(text, MessageType.TEXT, []);
  };

  const renderEmptyState = () => {
    if (!currentConversation) return null;

    const isGroup = currentConversation.type === "GROUP";
    const avatarUrl = getFullImageUrl(currentConversation.avatarUrl);
    const name = currentConversation.name || "Người dùng";
    const initials = name.charAt(0).toUpperCase();

    // Cấu hình nội dung khác nhau cho Group và Direct
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

  // --- LOGIC 4: FILE UPLOAD & SEND ---
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
    if (!inputText.trim() && selectedFiles.length === 0) return;

    let type = MessageType.TEXT;
    if (selectedFiles.length > 0) {
      const allImages = selectedFiles.every((f) => f.type.startsWith("image/"));
      type = allImages ? MessageType.IMAGE : MessageType.FILE;
    }

    const content = inputText;
    const files = selectedFiles;

    setInputText("");
    setSelectedFiles([]);

    // Scroll về đáy ngay khi gửi
    handleScrollToBottom();

    await sendMessage(content, type, files);
  };

  // Loading state ban đầu (khi chưa có ID conversation)
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
      {/* Drag & Drop Overlay */}
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

      {/* BODY: MESSAGE LIST OR EMPTY STATE */}
      <div className="flex-1 min-h-0 relative group">
        {messages.length > 0 ? (
          // TRƯỜNG HỢP 1: CÓ TIN NHẮN
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto p-4 scroll-smooth-disable flex flex-col-reverse gap-4"
            style={{ overflowAnchor: "none" }}
          >
            {messages.map((msg) => (
              <div key={msg.messageId} className="shrink-0">
                <MessageItem message={msg} />
              </div>
            ))}

            {/* Loading Indicator ở đỉnh (khi scroll load more) */}
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
          //  TRƯỜNG HỢP 2: ĐANG TẢI LẦN ĐẦU (Mảng rỗng + Loading = True)
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">
                Đang tải tin nhắn...
              </p>
            </div>
          </div>
        ) : (
          // TRƯỜNG HỢP 3: THỰC SỰ TRỐNG (Mảng rỗng + Loading = False)
          renderEmptyState()
        )}

        {/* Nút Scroll to Bottom (Giữ nguyên) */}
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

      {/* FOOTER: INPUT & FILES */}
      <div className="border-t shrink-0 bg-background">
        {/* File Preview */}
        {selectedFiles.length > 0 && (
          <div className="flex gap-3 px-4 py-3 overflow-x-auto border-b bg-muted/30">
            {selectedFiles.map((file, idx) => {
              const isImage = file.type.startsWith("image/");
              const previewUrl = URL.createObjectURL(file);

              return (
                <div
                  key={idx}
                  className="relative group shrink-0 w-20 h-20 rounded-md border bg-background overflow-hidden"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="absolute top-0.5 right-0.5 z-10 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>

                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-1">
                      <FileIcon className="h-6 w-6 text-muted-foreground mb-1" />
                      <span className="text-[8px] truncate max-w-full px-1">
                        {file.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 flex items-end gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => document.getElementById("manual-upload")?.click()}
            title="Đính kèm file"
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
            placeholder="Nhập tin nhắn..."
            className="flex-1 min-h-[40px]"
          />

          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputText.trim() && selectedFiles.length === 0}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ChatDetails open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />
    </div>
  );
}
