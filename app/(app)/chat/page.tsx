import { MessageSquareDashed } from "lucide-react";

export default function ChatEmptyPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
      <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
        <MessageSquareDashed className="h-10 w-10 opacity-50" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-lg">Chào mừng đến với Socius Chat</h3>
        <p className="text-sm">Chọn một cuộc hội thoại để bắt đầu nhắn tin.</p>
      </div>
    </div>
  );
}
