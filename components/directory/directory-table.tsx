"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquareText, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { getAvatarInfo } from "@/utils/avatar-utils";
import type { Employee } from "@/types/employee";
import { getFullImageUrl } from "@/utils/image-utils";
import { chatService } from "@/services/chat-service";
import { useChatStore } from "@/stores/use-chat-store";
import { MessageType } from "@/types/chat";

interface DirectoryTableProps {
  data: Employee[];
}

export function DirectoryTable({ data }: DirectoryTableProps) {
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
    <Card className="shadow-sm border-border/50 overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[300px]">{t("table.name")}</TableHead>
              <TableHead>{t("table.email")}</TableHead>
              <TableHead>{t("table.department")}</TableHead>
              <TableHead>{t("table.teams")}</TableHead>
              <TableHead className="w-[80px] text-right">
                {t("table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((emp) => {
              const { fullName, initials, avatarUrl } = getAvatarInfo(emp);
              const primaryDept = emp.departments?.find((d) => d.isPrimary);
              const displayAvatarUrl = getFullImageUrl(avatarUrl);
              const isChatLoading = chatLoadingId === emp.clientId;

              return (
                <TableRow
                  key={emp.clientId}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/directory/${emp.clientId}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border/50">
                        <AvatarImage
                          src={displayAvatarUrl || "/placeholder.svg"}
                        />
                        <AvatarFallback className="bg-linear-to-br from-emerald-500 to-teal-500 text-white text-xs font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {emp.userId}
                  </TableCell>
                  <TableCell>
                    {primaryDept ? (
                      <Badge
                        variant="outline"
                        className="font-normal bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200"
                      >
                        {primaryDept.departmentName}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        {t("cards.not_assigned")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {emp.teams?.slice(0, 2).map((team) => (
                        <Badge
                          key={team.teamCode}
                          variant="secondary"
                          className="text-xs"
                        >
                          {team.teamName}
                        </Badge>
                      ))}
                      {(emp.teams?.length || 0) > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(emp.teams?.length || 0) - 2}
                        </Badge>
                      )}
                      {(!emp.teams || emp.teams.length === 0) && (
                        <span className="text-xs text-muted-foreground italic">
                          {t("cards.no_teams")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
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
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
