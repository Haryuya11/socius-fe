"use client";

import { useEffect } from "react";
import { useChatStore } from "@/stores/use-chat-store";
import ChatSidebar from "@/components/chat/chat-sidebar";
import { useMsal } from "@azure/msal-react"; // Import MSAL để check đăng nhập

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loadConversations } = useChatStore();
  const { accounts } = useMsal();

  useEffect(() => {
    if (accounts.length > 0) {
      loadConversations();
    }

  }, [accounts, loadConversations]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden border bg-background">
      <div className="w-80 border-r bg-muted/10 flex flex-col shrink-0">
        <ChatSidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
