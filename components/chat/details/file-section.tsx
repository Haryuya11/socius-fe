"use client";

import { useMemo } from "react";
import { useChatStore } from "@/stores/use-chat-store";
import { isMediaFile, formatFileSize } from "@/utils/file-utils";
import { ChevronRight, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export function FileSection() {
  const { messages } = useChatStore();

  const fileList = useMemo(() => {
    const list: { name: string; size: number; url: string; type: string }[] =
      [];
    for (const msg of messages) {
      if (msg.metadata && msg.metadata.length > 0) {
        for (const meta of msg.metadata) {
          if (!isMediaFile(meta.mimeType)) {
            list.push({
              name: meta.fileName,
              size: meta.fileSize,
              url: meta.fileUrl,
              type: meta.mimeType,
            });
          }
        }
      }
    }
    return list;
  }, [messages]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="px-4">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between px-2 hover:bg-muted/50 p-0 h-12 group"
          >
            <span className="font-semibold text-sm text-foreground">
              File tài liệu
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {fileList.length}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        </div>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-[450px] p-0 flex flex-col h-full gap-0 bg-background border-l shadow-2xl">
        <SheetHeader className="px-4 h-14 border-b shrink-0 flex flex-row items-center space-y-0">
          <SheetTitle className="text-base font-semibold">
            File tài liệu
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 w-full h-full p-4">
          {fileList.length > 0 ? (
            <div className="flex flex-col gap-2">
              {fileList.map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all group/item"
                >
                  <div className="h-10 w-10 bg-blue-500/10 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 overflow-hidden min-w-0">
                    <p className="text-sm font-medium truncate text-foreground/90">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatFileSize(file.size)} •{" "}
                      {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Không có tài liệu
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Các file tài liệu được chia sẻ sẽ hiện ở đây
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
