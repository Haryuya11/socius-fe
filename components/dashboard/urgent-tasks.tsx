"use client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/task";
import { UrgentTasksSkeleton } from "../skeleton/dashboard/urgent-tasks-skeleton";

export function UrgentTasks({
  tasks,
  isLoading = false,
}: {
  tasks: Task[];
  isLoading?: boolean;
}) {
  const router = useRouter();

  if (isLoading) return <UrgentTasksSkeleton />;

  return (
    <Card className="shadow-sm flex flex-col border-border/60">
      <CardHeader>
        <CardTitle className="text-base text-destructive flex items-center gap-2">
          Cần xử lý gấp
        </CardTitle>
        <CardDescription>
          Các công việc sắp đến hạn hoặc quá hạn
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        {tasks.length === 0 ? (
          <div className="py-8 flex items-center justify-center text-sm text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
            Tuyệt vời! Không có công việc gấp.
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => router.push(`/tasks?taskId=${task.id}`)}
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 py-0 h-5 font-normal"
                    >
                      {task.teamCode}
                    </Badge>
                    <span>•</span>
                    <span
                      className={
                        task.status === "OVERDUE"
                          ? "text-destructive font-medium"
                          : ""
                      }
                    >
                      {format(new Date(task.dueDate), "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>
                {task.priority === "HIGH" && (
                  <Badge variant="destructive" className="h-5 text-[10px]">
                    Cao
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <div className="p-4 pt-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-muted-foreground hover:text-primary"
          onClick={() => router.push("/tasks")}
        >
          Đến trang quản lý <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
