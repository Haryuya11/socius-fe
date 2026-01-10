"use client";

import { useState, useEffect, useMemo } from "react";
import { Bell, CheckCheck, Loader2, Inbox, ExternalLink } from "lucide-react";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { useTranslations, useFormatter } from "next-intl";
import { useRouter } from "next/navigation"; // Thêm router để chuyển trang

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/stores/use-notification-store";
import { parseToUtcDate } from "@/utils/date-utils";

export function NotificationMenu() {
  const t = useTranslations("Notifications");
  const format = useFormatter();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all"); // State cho bộ lọc

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

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, loadMore]);

  // Logic lọc tin nhắn
  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => n.isRead === 0);
    }
    return notifications;
  }, [notifications, filter]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleItemClick = (item: any) => {
    if (item.isRead === 0) {
      markRead(item.id);
    }
    setIsOpen(false);
  };

  const handleViewAllPage = () => {
    setIsOpen(false);
    router.push("/notifications");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative shrink-0 hover:bg-muted/50 transition-colors"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-sm ring-2 ring-background animate-in zoom-in duration-300">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-85 p-0 sm:w-96 border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]"
        align="end"
        sideOffset={8}
      >
        {/* --- Header & Tabs --- */}
        <div className="flex flex-col border-b border-border/40 bg-linear-to-br from-primary/10 via-primary/5 to-background">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-foreground">
                {t("title")}
              </h4>
              {unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-primary/20"
                >
                  {unreadCount} {t("new")}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 rounded-full transition-all"
                onClick={() => markAllRead()}
              >
                <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                {t("mark_all_read")}
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex px-4 pb-2 gap-4">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "text-xs font-medium pb-1.5 border-b-2 transition-all",
                filter === "all"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t("filters.all")}
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn(
                "text-xs font-medium pb-1.5 border-b-2 transition-all",
                filter === "unread"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t("filters.unread")}
            </button>
          </div>
        </div>

        {/* --- Content --- */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 && !isLoading ? (
            // Trường hợp chưa có tin nhắn nào
            <div className="flex flex-col h-[300px] items-center justify-center text-center p-6 gap-3">
              <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-2">
                <Inbox className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("empty.message")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("empty.description")}
                </p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 && filter === "unread" ? (
            // Trường hợp đã lọc Unread nhưng không có
            <div className="flex flex-col h-[300px] items-center justify-center text-center p-6 gap-3">
              <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                <CheckCheck className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("empty.no_unread")}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col py-0 divide-y divide-border/30">
              {filteredNotifications.map((item) => {
                const isUnread = item.isRead === 0;

                const ContentWrapper = ({
                  children,
                }: {
                  children: React.ReactNode;
                }) =>
                  item.payload.linkUrl ? (
                    <Link
                      href={item.payload.linkUrl}
                      className="block focus:outline-none"
                      onClick={() => handleItemClick(item)}
                    >
                      {children}
                    </Link>
                  ) : (
                    <div onClick={() => handleItemClick(item)}>{children}</div>
                  );

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "relative flex cursor-pointer items-start gap-4 px-4 py-4 transition-all duration-200 group",
                      isUnread
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "bg-transparent hover:bg-muted/50"
                    )}
                  >
                    {isUnread && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />
                    )}

                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors border",
                        isUnread
                          ? "bg-primary/15 text-primary border-primary/20"
                          : "bg-muted/50 text-muted-foreground border-transparent group-hover:bg-muted"
                      )}
                    >
                      <Bell className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <ContentWrapper>
                        <div className="flex justify-between items-start gap-2">
                          <p
                            className={cn(
                              "text-sm leading-snug truncate pr-2",
                              isUnread
                                ? "font-semibold text-foreground"
                                : "font-normal text-muted-foreground"
                            )}
                          >
                            {item.payload.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground/70 shrink-0 whitespace-nowrap">
                            {format.relativeTime(
                              parseToUtcDate(item.createdAt), 
                              { now: new Date() } 
                            )}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "text-xs line-clamp-2",
                            isUnread
                              ? "text-foreground/80"
                              : "text-muted-foreground/70"
                          )}
                        >
                          {item.payload.content}
                        </p>
                      </ContentWrapper>
                    </div>
                    {isUnread && (
                      <span className="mt-2 h-2 w-2 rounded-full bg-primary shrink-0 ring-2 ring-primary/20 shadow-sm animate-pulse" />
                    )}
                  </div>
                );
              })}

              <div
                ref={loadMoreRef}
                className="h-14 flex items-center justify-center w-full"
              >
                {isLoading && hasMore && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Loading...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* --- Footer: View All --- */}
        <div className="p-2 border-t border-border/40 bg-card/50 backdrop-blur-sm">
          <Button
            variant="ghost"
            className="w-full text-xs h-9 gap-2 text-muted-foreground hover:text-primary"
            onClick={handleViewAllPage}
          >
            {t("view_all")}
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
