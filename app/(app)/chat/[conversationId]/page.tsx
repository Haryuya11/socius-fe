"use client";

import { useEffect, use } from "react";
import { useChatStore } from "@/stores/use-chat-store";
import ChatWindow from "@/components/chat/chat-window";

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default function ChatDetailPage({ params }: PageProps) {
  const { conversationId } = use(params);
  const { selectConversation } = useChatStore();

  useEffect(() => {
    if (conversationId) {
      selectConversation(conversationId);
    }
  }, [conversationId, selectConversation]);

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden flex flex-col">
      <ChatWindow key={conversationId} />
    </div>
  );
}
