/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { taskService } from "@/services/task-service";
import { WorkflowConfig } from "@/types/task";

type ActionType = "SUBMIT" | "APPROVE" | "REJECT" | "CANCEL" | "REOPEN";

interface TaskWorkflowDialogProps {
  taskId: number;
  open: boolean;
  type: ActionType;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TaskWorkflowDialog({
  taskId,
  open,
  type,
  onOpenChange,
  onSuccess,
}: TaskWorkflowDialogProps) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  // Config object định nghĩa hành vi cho từng loại Action
  const config: Record<ActionType, WorkflowConfig> = {
    SUBMIT: {
      title: "Gửi duyệt Task",
      label: "Ghi chú hoàn thành",
      action: taskService.submitReview,
    },
    APPROVE: {
      title: "Phê duyệt Task",
      label: "Ghi chú (tùy chọn)",
      action: taskService.approveTask,
    },
    REJECT: {
      title: "Từ chối Task",
      label: "Lý do từ chối",
      action: taskService.rejectTask,
      required: true, // Bắt buộc nhập lý do
    },
    CANCEL: {
      title: "Hủy Task",
      label: "Lý do hủy",
      action: taskService.cancelTask,
      required: true,
    },
    REOPEN: {
      title: "Mở lại Task",
      label: "Lý do (tùy chọn)",
      action: taskService.reopenTask,
    },
  };

  const currentConfig = config[type];

  const handleSubmit = async () => {
    if (currentConfig.required && !note.trim()) {
      toast.error("Vui lòng nhập nội dung");
      return;
    }

    try {
      setLoading(true);
      await currentConfig.action(taskId, note);
      toast.success("Thao tác thành công");
      onOpenChange(false);
      setNote("");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentConfig.title}</DialogTitle>
          <DialogDescription>
            Hành động này sẽ cập nhật trạng thái của Task.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          <Label>
            {currentConfig.label}{" "}
            {currentConfig.required && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập nội dung..."
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
