/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
// [UPDATE 1] Import hooks điều hướng
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Plus,
  User,
  RotateCcw,
  ChevronLeft,
  ArrowUpRight,
} from "lucide-react"; // Thêm icon
import { TaskStatusBadge, TaskPriorityBadge } from "./task-badges";
import { taskService } from "@/services/task-service";
import { Task, TaskActivity } from "@/types/task";
import { TaskWorkflowDialog } from "./task-workflow-dialog";
import { CreateSubTaskDialog } from "./create-subtask-dialog";

interface TaskDetailSheetProps {
  taskId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  currentUserId: string;
}

export function TaskDetailSheet({
  taskId,
  open,
  onOpenChange,
  onUpdate,
  currentUserId,
}: TaskDetailSheetProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [subTasks, setSubTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<TaskActivity[]>([]);

  const [actionType, setActionType] = useState<any>(null);
  const [isSubTaskOpen, setIsSubTaskOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // [UPDATE 2] Khởi tạo hooks router
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!taskId || !open) return;
    let isMounted = true;
    const fetch = async () => {
      try {
        const [t, s, a] = await Promise.all([
          taskService.getTaskDetail(taskId),
          taskService.getSubTasks(taskId),
          taskService.getTaskActivities(taskId),
        ]);
        if (isMounted) {
          setTask(t);
          setSubTasks(s);
          setActivities(a);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
    return () => {
      isMounted = false;
    };
  }, [taskId, open, refreshKey]);

  // [UPDATE 3] Hàm chuyển hướng sang Task khác (dùng cho subtask hoặc quay lại cha)
  const navigateToTask = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("taskId", id.toString());
    // Dùng push để lưu lịch sử, user có thể bấm Back browser để quay lại task cha
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (!task) return null;

  const isSender = task.senderId === currentUserId;
  const isReceiver = task.receiverId === currentUserId;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[600px] w-full flex flex-col p-0">
          <div className="p-6 border-b bg-muted/10">
            <SheetHeader className="mb-4">
              {/* [UPDATE 4] Nếu có parentId (đây là subtask), hiện nút quay lại cha */}
              {task.parentId && (
                <Button
                  variant="link"
                  className="p-0 h-auto mb-2 text-muted-foreground hover:text-primary justify-start w-fit"
                  onClick={() => navigateToTask(task.parentId!)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại Task cha #
                  {task.parentId}
                </Button>
              )}

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">#{task.id}</Badge>
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
              </div>
              <SheetTitle className="text-xl leading-relaxed">
                {task.title}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Hạn:{" "}
                  {format(new Date(task.dueDate), "dd/MM/yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> Giao bởi: {task.senderName}
                </span>
              </SheetDescription>
            </SheetHeader>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-2">
              {isReceiver && task.status === "IN_PROGRESS" && (
                <Button size="sm" onClick={() => setActionType("SUBMIT")}>
                  Gửi duyệt hoàn thành
                </Button>
              )}
              {isSender && task.status === "PENDING" && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setActionType("APPROVE")}
                  >
                    Phê duyệt
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setActionType("REJECT")}
                  >
                    Từ chối
                  </Button>
                </>
              )}
              {isSender &&
                task.status !== "APPROVED" &&
                task.status !== "CANCELLED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/50"
                    onClick={() => setActionType("CANCEL")}
                  >
                    Hủy Task
                  </Button>
                )}
              {(isSender || isReceiver) &&
                (task.status === "OVERDUE" || task.status === "REJECTED") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActionType("REOPEN")}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Mở lại
                  </Button>
                )}
            </div>
          </div>

          <Tabs
            defaultValue="info"
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-6 pt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="subtasks">
                  Việc phụ ({subTasks.length})
                </TabsTrigger>
                <TabsTrigger value="activity">Lịch sử</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 p-6">
              <TabsContent value="info" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">
                      Người nhận
                    </span>
                    <div className="font-medium flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        {task.receiverName.charAt(0)}
                      </div>
                      {task.receiverName}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">
                      Ngày bắt đầu
                    </span>
                    <div className="font-medium">
                      {format(new Date(task.startDate), "dd/MM/yyyy")}
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Mô tả</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {task.description || "Không có mô tả."}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="subtasks" className="mt-0 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm">
                    Danh sách công việc phụ
                  </h4>
                  {(isSender || isReceiver) &&
                    task.status === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={() => setIsSubTaskOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Thêm
                      </Button>
                    )}
                </div>

                {/* [UPDATE 5] List Subtasks có khả năng click */}
                {subTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Chưa có công việc phụ nào
                  </div>
                ) : (
                  <div className="space-y-2">
                    {subTasks.map((sub) => (
                      <div
                        key={sub.id}
                        // Thêm class hover và cursor-pointer
                        className="group border rounded-lg p-3 flex items-start justify-between bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                        // Gọi hàm chuyển trang khi click
                        onClick={() => navigateToTask(sub.id)}
                      >
                        <div>
                          <p className="font-medium text-sm flex items-center gap-2">
                            {sub.title}
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <TaskStatusBadge status={sub.status} />
                            <span className="text-xs text-muted-foreground">
                              {sub.receiverName}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {format(new Date(sub.dueDate), "dd/MM")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <div className="border-l-2 border-muted pl-4 space-y-6">
                  {activities.map((act) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[21px] top-0 h-3 w-3 rounded-full bg-muted-foreground/30 ring-4 ring-background" />
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {format(new Date(act.createdAt), "HH:mm dd/MM/yyyy")}
                        </span>
                        <p className="text-sm font-medium">
                          {act.actorName}{" "}
                          <span className="font-normal text-muted-foreground">
                            đã
                          </span>{" "}
                          {act.activityType}
                        </p>
                        {act.note && (
                          <div className="bg-muted/50 p-2 rounded text-xs italic text-muted-foreground mt-1">
                            &quot;{act.note}&quot;
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Dialogs giữ nguyên */}
      {actionType && task && (
        <TaskWorkflowDialog
          open={!!actionType}
          onOpenChange={() => setActionType(null)}
          taskId={task.id}
          type={actionType}
          onSuccess={() => {
            setRefreshKey((k) => k + 1);
            onUpdate();
          }}
        />
      )}

      {isSubTaskOpen && task && (
        <CreateSubTaskDialog
          open={isSubTaskOpen}
          onOpenChange={setIsSubTaskOpen}
          parentTask={task}
          onSuccess={() => {
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </>
  );
}
