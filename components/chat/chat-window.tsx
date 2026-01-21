"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useChatStore } from "@/stores/use-chat-store";
import { MessageType } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Paperclip, X, File as FileIcon, Info } from "lucide-react";
// BỎ: import { ScrollArea } from "@/components/ui/scroll-area";
import MessageItem from "./message-item";
import { useDropzone } from "react-dropzone";
import { ChatDetails } from "./chat-details";

export default function ChatWindow() {
  const {
    activeConversationId,
    messages,
    isLoadingMessages,
    sendMessage,
    loadMoreMessages,
    hasMoreMessages,
    conversations,
  } = useChatStore();

  const [inputText, setInputText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  // Ref trỏ vào div chứa tin nhắn để scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  // --- AUTO SCROLL LOGIC (NATIVE DIV) ---
  useEffect(() => {
    if (scrollContainerRef.current && !isLoadingMessages) {
      const container = scrollContainerRef.current;
      // Timeout nhỏ để đảm bảo DOM đã render xong message mới
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
    }
  }, [messages, isLoadingMessages]);

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

    const contentToSend = inputText;
    const filesToSend = selectedFiles;

    setInputText("");
    setSelectedFiles([]);

    await sendMessage(contentToSend, type, filesToSend);
  };

  if (!activeConversationId || (isLoadingMessages && messages.length === 0)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentConversation = conversations.find(
    (c) => c.conversationId === activeConversationId,
  );

  const displayTitle = currentConversation?.name || "Cuộc trò chuyện";

  return (
    // Container chính: flex-col, h-full, overflow-hidden để chặn scroll trang ngoài
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

      {/* HEADER: shrink-0 để không bị co lại */}
      <div className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-card/50 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold truncate max-w-[200px] sm:max-w-md">
            {displayTitle}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDetailsOpen(true)}
        >
          <Info className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      {/* MESSAGE LIST: flex-1 để chiếm toàn bộ khoảng trống còn lại, overflow-y-auto để cuộn */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
      >
        {hasMoreMessages && (
          <div className="flex justify-center p-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadMoreMessages()}
              disabled={isLoadingMessages}
            >
              {isLoadingMessages ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Tải thêm tin nhắn cũ"
              )}
            </Button>
          </div>
        )}

        {/* Flex-col-reverse để tin nhắn mới nhất nằm dưới đáy (logic CSS) */}
        {/* Hoặc dùng flex-col thường và scroll xuống đáy (Logic JS) */}
        {/* Ở đây bạn đang map xuôi trong store, nên ta dùng flex-col thường + JS scroll to bottom */}
        <div className="flex flex-col-reverse gap-4 pb-2">
          {messages.map((msg) => (
            <MessageItem key={msg.messageId} message={msg} />
          ))}
        </div>
      </div>

      {/* FOOTER: shrink-0 để luôn ghim đáy */}
      <div className="bg-background border-t shrink-0 p-0">
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
                    onClick={() => removeFile(idx)}
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
                      <span className="text-[8px] text-center w-full truncate px-1">
                        {file.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="p-4 flex items-end gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0"
            onClick={() => document.getElementById("manual-upload")?.click()}
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
            className="flex-1 min-h-10 bg-background"
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
