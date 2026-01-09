"use client";

import { useState, useEffect } from "react"; // 1. Import thêm useEffect
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useNotificationStore } from "@/stores/use-notification-store";
import { formatRelativeTime } from "@/lib/date-utils";

export function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    loadMore,
    hasMore,
    isLoading,
    markRead,
    markAllRead,
  } = useNotificationStore();

  const { ref: loadMoreRef, inView } = useInView();

  // 🔴 SAI (Gây lỗi): Gọi trực tiếp trong body component
  /* if (inView && hasMore && !isLoading) {
    loadMore();
  } 
  */

  // 🟢 ĐÚNG: Bọc vào useEffect để chạy sau khi render xong
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, loadMore]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleItemClick = (item: any) => {
    if (item.isRead === 0) {
      markRead(item.id);
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      {/* ... Phần UI giữ nguyên không đổi ... */}
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 sm:w-96 shadow-lg" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/20">
          <h4 className="font-semibold text-sm">Thông báo</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => markAllRead()}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 && !isLoading ? (
            <div className="flex flex-col h-64 items-center justify-center text-sm text-muted-foreground gap-2">
              <Bell className="h-8 w-8 opacity-20" />
              <p>Bạn không có thông báo nào.</p>
            </div>
          ) : (
            <div className="flex flex-col py-1">
              {notifications.map((item) => {
                const isUnread = item.isRead === 0;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "relative flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors group",
                      isUnread
                        ? "bg-blue-50/60 dark:bg-blue-900/20 hover:bg-blue-100/50"
                        : "bg-transparent hover:bg-muted/50"
                    )}
                    onClick={() => {
                      if (!item.payload.linkUrl) handleItemClick(item);
                    }}
                  >
                    <div
                      className={cn(
                        "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
                        isUnread
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Bell className="h-4 w-4" />
                    </div>

                    <div className="flex-1 space-y-1">
                      {item.payload.linkUrl ? (
                        <Link
                          href={item.payload.linkUrl}
                          className="block focus:outline-none"
                          onClick={() => handleItemClick(item)}
                        >
                          <p
                            className={cn(
                              "text-sm leading-snug",
                              isUnread
                                ? "font-bold text-foreground"
                                : "font-normal text-muted-foreground"
                            )}
                          >
                            {item.payload.title}
                          </p>
                          <p
                            className={cn(
                              "text-xs line-clamp-2 mt-0.5",
                              isUnread
                                ? "text-foreground/80"
                                : "text-muted-foreground/70"
                            )}
                          >
                            {item.payload.content}
                          </p>
                        </Link>
                      ) : (
                        <div>
                          <p
                            className={cn(
                              "text-sm leading-snug",
                              isUnread
                                ? "font-bold text-foreground"
                                : "font-normal text-muted-foreground"
                            )}
                          >
                            {item.payload.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {item.payload.content}
                          </p>
                        </div>
                      )}

                      <p
                        className={cn(
                          "text-[10px] font-medium mt-1",
                          isUnread
                            ? "text-blue-600"
                            : "text-muted-foreground/60"
                        )}
                      >
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>

                    {isUnread && (
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0 ring-2 ring-background shadow-sm" />
                    )}
                  </div>
                );
              })}

              <div
                ref={loadMoreRef}
                className="h-10 flex items-center justify-center w-full"
              >
                {isLoading && hasMore && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
