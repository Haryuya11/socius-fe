"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Mail,
  MessageSquareText,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { getAvatarInfo } from "@/utils/avatar-utils";
import type { Employee } from "@/types/employee";
import { getFullImageUrl } from "@/utils/image-utils";
import { chatService } from "@/services/chat-service";
import { useChatStore } from "@/stores/use-chat-store";
import { MessageType } from "@/types/chat";

interface DirectoryGridProps {
  data: Employee[];
}

export function DirectoryGrid({ data }: DirectoryGridProps) {
  const t = useTranslations("Directory");
  const tChat = useTranslations("Chat");
  const router = useRouter();
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);
  const { addConversationToStore } = useChatStore();

  const handleStartChat = async (e: React.MouseEvent, employee: Employee) => {
    e.stopPropagation();
    try {
      setChatLoadingId(employee.clientId);

      const conversation = await chatService.createDirectConversation(
        employee.clientId,
      );

      if (conversation && conversation.conversationId) {
        addConversationToStore({
          conversationId: conversation.conversationId,
          type: conversation.type,
          name: conversation.name || "Cuộc trò chuyện",
          avatarUrl: conversation.avatarUrl,
          createdBy: conversation.createdBy,
          lastMessageId: conversation.lastMessageId,
          lastMessageAt: conversation.lastMessageAt,
          createdAt: conversation.createdAt,
          lastMessageContent: "",
          lastMessageType: MessageType.TEXT,
          lastSenderId: "",
          unreadCount: 0,
        });

        router.push(`/chat/${conversation.conversationId}`);
      } else {
        toast.error(tChat("create_failed"));
      }
    } catch (error) {
      console.error(error);
      toast.error(tChat("connect_failed"));
    } finally {
      setChatLoadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((emp) => {
        const { fullName, initials, avatarUrl } = getAvatarInfo(emp);
        const primaryDept = emp.departments?.find((d) => d.isPrimary);
        const displayAvatarUrl = getFullImageUrl(avatarUrl);
        const isChatLoading = chatLoadingId === emp.clientId;

        return (
          <Card
            key={emp.clientId}
            className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 group overflow-hidden cursor-pointer"
            onClick={() => router.push(`/directory/${emp.clientId}`)}
          >
            <CardHeader className="pb-3 space-y-0">
              <div className="flex items-start gap-3">
                <Avatar className="h-14 w-14 border-2 border-border/50 shadow-md group-hover:border-primary/30 transition-colors">
                  <AvatarImage src={displayAvatarUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-linear-to-br from-emerald-500 to-teal-500 text-white font-semibold text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                  <CardTitle
                    className="text-base truncate leading-tight"
                    title={fullName}
                  >
                    {fullName}
                  </CardTitle>
                  <CardDescription
                    className="truncate text-xs mt-0.5 flex items-center gap-1"
                    title={emp.userId}
                  >
                    <Mail className="h-3 w-3" />
                    {emp.userId}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0"
                  onClick={(e) => handleStartChat(e, emp)}
                  disabled={isChatLoading}
                  title={t("chat")}
                >
                  {isChatLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquareText className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  <Building2 className="h-3 w-3" />
                  {t("cards.department")}
                </div>
                <div className="flex items-center gap-2 text-sm min-h-5">
                  {primaryDept ? (
                    <Badge
                      variant="outline"
                      className="font-normal bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200 text-xs"
                    >
                      {primaryDept.departmentName}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      {t("cards.not_assigned")}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  <Users className="h-3 w-3" />
                  {t("cards.teams_count", { count: emp.teams?.length || 0 })}
                </div>
                <div className="flex flex-wrap gap-1 min-h-6">
                  {emp.teams?.slice(0, 2).map((team) => (
                    <Badge
                      key={team.teamCode}
                      variant="secondary"
                      className="text-[10px] h-5"
                    >
                      {team.teamName}
                    </Badge>
                  ))}
                  {(emp.teams?.length || 0) > 2 && (
                    <Badge variant="outline" className="text-[10px] h-5">
                      +{(emp.teams?.length || 0) - 2}
                    </Badge>
                  )}
                  {(!emp.teams || emp.teams.length === 0) && (
                    <span className="text-xs text-muted-foreground italic">
                      {t("cards.no_teams")}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
