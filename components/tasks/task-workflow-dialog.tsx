/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Tasks.workflow");
  const tMessages = useTranslations("Tasks.messages");
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  // Config object định nghĩa hành vi cho từng loại Action
  const config: Record<ActionType, WorkflowConfig> = {
    SUBMIT: {
      title: t("submit_title"),
      label: t("submit_label"),
      action: taskService.submitReview,
    },
    APPROVE: {
      title: t("approve_title"),
      label: t("approve_label"),
      action: taskService.approveTask,
    },
    REJECT: {
      title: t("reject_title"),
      label: t("reject_label"),
      action: taskService.rejectTask,
      required: true, // Bắt buộc nhập lý do
    },
    CANCEL: {
      title: t("cancel_title"),
      label: t("cancel_label"),
      action: taskService.cancelTask,
      required: true,
    },
    REOPEN: {
      title: t("reopen_title"),
      label: t("reopen_label"),
      action: taskService.reopenTask,
    },
  };

  const currentConfig = config[type];

  const handleSubmit = async () => {
    if (currentConfig.required && !note.trim()) {
      toast.error(t("required_error"));
      return;
    }

    try {
      setLoading(true);
      await currentConfig.action(taskId, note);
      toast.success(tMessages("action_success"));
      onOpenChange(false);
      setNote("");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || tMessages("error"));
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
            {t("description")}
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
            placeholder={t("placeholder")}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel_button")}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("confirm_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
