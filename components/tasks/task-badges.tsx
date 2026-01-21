"use client";
import { Badge } from "@/components/ui/badge";
import { TaskPriority, TaskStatus } from "@/types/task";
import { useTranslations } from "next-intl";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const t = useTranslations("Tasks.status");
  
  const styles: Record<TaskStatus, string> = {
    IN_PROGRESS: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
    PENDING:
      "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200", 
    APPROVED: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
    REJECTED: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
    OVERDUE: "bg-rose-500 text-white hover:bg-rose-600 border-rose-600", 
    CANCELLED: "bg-gray-500 text-white hover:bg-gray-600 border-gray-600", 
  };

  return (
    <Badge
      variant="outline"
      className={`${styles[status]} font-medium whitespace-nowrap`}
    >
      {t(status)}
    </Badge>
  );
}

export function TaskPriorityBadge({
  priority,
}: {
  priority: TaskPriority | null;
}) {
  const t = useTranslations("Tasks.priority");
  
  if (!priority) return null;

  const styles: Record<string, string> = {
    LOW: "text-gray-500 bg-gray-50 border-gray-200",
    MEDIUM: "text-blue-500 bg-blue-50 border-blue-200",
    HIGH: "text-red-500 bg-red-50 border-red-200",
    "0": "text-gray-500 bg-gray-50 border-gray-200",
    "1": "text-blue-500 bg-blue-50 border-blue-200",
    "2": "text-red-500 bg-red-50 border-red-200",
  };

  const priorityKey = ["LOW", "MEDIUM", "HIGH"].includes(priority)
    ? priority
    : ["0", "1", "2"].includes(priority)
    ? ["LOW", "MEDIUM", "HIGH"][parseInt(priority)]
    : priority;

  return (
    <Badge variant="outline" className={styles[priority]}>
      {t(priorityKey)}
    </Badge>
  );
}
