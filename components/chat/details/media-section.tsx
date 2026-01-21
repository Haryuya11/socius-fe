/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useChatStore } from "@/stores/use-chat-store";
import { isMediaFile } from "@/utils/file-utils";
import {
  ChevronRight,
  Image as ImageIcon,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MediaViewer } from "@/components/chat/media-viewer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Import Sheet components
import { ScrollArea } from "@/components/ui/scroll-area";

export function MediaSection() {
  const { messages } = useChatStore();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: "image" | "video";
    name: string;
  } | null>(null);

  // Lọc danh sách Media
  const mediaList = useMemo(() => {
    const list: {
      url: string;
      id: string;
      type: "image" | "video";
      name: string;
    }[] = [];
    for (const msg of messages) {
      if (msg.metadata && msg.metadata.length > 0) {
        for (const meta of msg.metadata) {
          if (isMediaFile(meta.mimeType)) {
            list.push({
              url: meta.fileUrl,
              id: meta.fileUrl,
              type: meta.mimeType.startsWith("video/") ? "video" : "image",
              name: meta.fileName,
            });
          }
        }
      }
    }
    return list;
  }, [messages]);

  const handleMediaClick = (media: any) => {
    setSelectedMedia(media);
    setViewerOpen(true);
  };

  return (
    <>
      <Sheet>
        {/* Nút kích hoạt mở Sheet */}
        <SheetTrigger asChild>
          <div className="px-4">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between px-2 hover:bg-muted/50 p-0 h-12 group"
            >
              <span className="font-semibold text-sm text-foreground">
                File phương tiện
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {mediaList.length}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </div>
        </SheetTrigger>

        {/* Nội dung Sheet con (Nested Sheet) */}
        <SheetContent className="w-full sm:max-w-[450px] p-0 flex flex-col h-full gap-0 bg-background border-l shadow-2xl">
          <SheetHeader className="px-4 h-14 border-b shrink-0 flex flex-row items-center gap-2 space-y-0">
            {/* Tiêu đề sheet con */}
            <SheetTitle className="text-base font-semibold">
              File phương tiện
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 w-full h-full p-1">
            {mediaList.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 p-1">
                {mediaList.map((media, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden bg-muted cursor-pointer hover:opacity-90 group/item border border-border/50"
                    onClick={() => handleMediaClick(media)}
                  >
                    {media.type === "video" ? (
                      <>
                        <video
                          src={media.url}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/item:bg-black/30 transition-all">
                          <PlayCircle className="w-8 h-8 text-white/90 shadow-lg" />
                        </div>
                      </>
                    ) : (
                      <Image
                        src={media.url}
                        alt={media.name}
                        fill
                        className="object-cover transition-transform group-hover/item:scale-105"
                        sizes="(max-width: 768px) 33vw, 150px"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Không có media
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ảnh và video được chia sẻ sẽ hiện ở đây
                </p>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Media Viewer (Lightbox) */}
      {selectedMedia && (
        <MediaViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          url={selectedMedia.url}
          type={selectedMedia.type}
          fileName={selectedMedia.name}
        />
      )}
    </>
  );
}
