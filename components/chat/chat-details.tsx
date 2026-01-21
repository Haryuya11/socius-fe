"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChatStore } from "@/stores/use-chat-store";

import { ChatHeader } from "./details/chat-header";
import { MediaSection } from "./details/media-section";
import { FileSection } from "./details/file-section";
import { MemberSection } from "./details/member-section";
import { PrivacySection } from "./details/privacy-section";

interface ChatDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDetails({ open, onOpenChange }: ChatDetailsProps) {
  const { activeConversationId, conversations } = useChatStore();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const currentConv = conversations.find(
    (c) => c.conversationId === activeConversationId,
  );

  if (!currentConv) return null;

  const isGroup = currentConv.type === "GROUP";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[450px] p-0 flex flex-col h-full gap-0 bg-background border-l shadow-xl">
        <SheetHeader className="px-6 h-14 border-b shrink-0 flex flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-base font-semibold">
            Thông tin hội thoại
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden h-full w-full">
          <ScrollArea className="h-full w-full">
            <div className="flex flex-col pb-10">
              <ChatHeader
                conversation={currentConv}
                isGroup={isGroup}
                onAddMember={() => setIsAddMemberOpen(true)}
              />
              <Separator className="my-2" />
              <div className="py-2 flex flex-col">
                <MediaSection />
                <FileSection />
              </div>
              <Separator className="my-2" />
              <MemberSection
                isAddMemberOpen={isAddMemberOpen}
                setIsAddMemberOpen={setIsAddMemberOpen}
              />
              <Separator className="my-4" />
              <PrivacySection onClose={() => onOpenChange(false)} />
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
