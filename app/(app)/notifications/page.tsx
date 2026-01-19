"use client";

import { useEffect, useMemo, useState } from "react";
import { useNotificationStore } from "@/stores/use-notification-store";
import { useInView } from "react-intersection-observer";
import { Bell, CheckCheck, Inbox, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useFormatter } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseToUtcDate } from "@/utils/date-utils";
import { NotificationMessage } from "@/types/notification"; // Import Type

export default function NotificationsPage() {
  const t = useTranslations("Notifications");
  const format = useFormatter();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const {
    notifications,
    loadMore,
    hasMore,
    isLoading,
    markRead,
    markAllRead,
    unreadCount,
  } = useNotificationStore();

  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, loadMore]);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => n.isRead === 0);
    }
    return notifications;
  }, [notifications, filter]);

  const handleItemClick = (item: NotificationMessage) => {
    if (item.isRead === 0) {
      markRead(item.id);
    }
  };

  return (
    <main className="min-h-screen bg-background animate-in fade-in-0 duration-500">
      {/* Header Section */}
      <div className="bg-linear-to-br from-primary/10 via-primary/5 to-background border-b border-border/40 sticky top-0 z-10 backdrop-blur-md bg-background/80">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-background/50"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              {t("title")}
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="h-6 px-2 text-xs rounded-full"
                >
                  {unreadCount} {t("new")}
                </Badge>
              )}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Tabs Style */}
            <div className="flex items-center p-1 bg-muted/40 rounded-lg border border-border/40 w-fit">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  filter === "all"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t("filters.all")}
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  filter === "unread"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t("filters.unread")}
              </button>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent border-primary/20 text-primary hover:bg-primary/5 hover:text-primary"
                onClick={() => markAllRead()}
              >
                <CheckCheck className="h-4 w-4" />
                {t("mark_all_read")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content List */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 pb-20">
        {notifications.length === 0 && !isLoading ? (
          <div className="flex flex-col h-96 items-center justify-center text-center">
            <div className="h-20 w-20 rounded-3xl bg-muted/30 flex items-center justify-center mb-4">
              <Inbox className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {t("empty.message")}
            </h3>
            <p className="text-muted-foreground mt-1">
              {t("empty.description")}
            </p>
          </div>
        ) : filteredNotifications.length === 0 && filter === "unread" ? (
          <div className="flex flex-col h-64 items-center justify-center text-center border-2 border-dashed border-border/40 rounded-xl m-4">
            <CheckCheck className="h-10 w-10 text-green-500 mb-3" />
            <p className="font-medium text-foreground">
              {t("empty.no_unread")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((item) => {
              const isUnread = item.isRead === 0;

              // Updated: Sử dụng redirectUrl thay vì payload.linkUrl
              const ContentWrapper = ({
                children,
              }: {
                children: React.ReactNode;
              }) =>
                item.redirectUrl ? (
                  <Link
                    href={item.redirectUrl}
                    className="block w-full"
                    onClick={() => handleItemClick(item)}
                  >
                    {children}
                  </Link>
                ) : (
                  <div
                    className="w-full cursor-pointer"
                    onClick={() => handleItemClick(item)}
                  >
                    {children}
                  </div>
                );

              return (
                <ContentWrapper key={item.id}>
                  <Card
                    className={cn(
                      "relative overflow-hidden transition-all duration-300 hover:shadow-md border-border/40",
                      isUnread
                        ? "bg-card/80 dark:bg-card/60 border-primary/20"
                        : "bg-card/40 hover:bg-card/60",
                    )}
                  >
                    {isUnread && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    <div className="flex gap-4 p-5">
                      <div
                        className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors",
                          isUnread
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted/50 text-muted-foreground border-transparent",
                        )}
                      >
                        <Bell className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h4
                            className={cn(
                              "text-base truncate pr-2",
                              isUnread
                                ? "font-bold text-foreground"
                                : "font-medium text-muted-foreground",
                            )}
                          >
                            {/* UPDATED: Truy cập trực tiếp title */}
                            {item.title}
                          </h4>
                          <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap bg-muted/40 px-2 py-1 rounded-md">
                            {format.relativeTime(
                              parseToUtcDate(item.createdAt),
                              { now: new Date() },
                            )}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "text-sm leading-relaxed line-clamp-2",
                            isUnread
                              ? "text-foreground/90"
                              : "text-muted-foreground/80",
                          )}
                        >
                          {/* UPDATED: Truy cập trực tiếp content */}
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </Card>
                </ContentWrapper>
              );
            })}

            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {isLoading && hasMore && (
                <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
