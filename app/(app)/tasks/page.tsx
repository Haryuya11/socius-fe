/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  CalendarIcon,
  LayoutList,
  Plus,
  Search,
  Briefcase,
  Send,
  FileSignature,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaginationControl } from "@/components/ui/pagination-control";
import { taskService } from "@/services/task-service";
import { Task, TaskSearchCondition } from "@/types/task";
import {
  TaskStatusBadge,
  TaskPriorityBadge,
} from "@/components/tasks/task-badges";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskDetailSheet } from "@/components/tasks/task-detail-sheet";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TaskWorkflowDialog } from "@/components/tasks/task-workflow-dialog";
import { useAuth } from "@/hooks/use-auth";
import { usePermission } from "@/hooks/use-permission";
// [MỚI] Import Filter
import { TaskFilter, FilterState } from "@/components/tasks/task-filter";

export default function TasksPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { hasPermission, getTeamsWithPermission } = usePermission();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [viewMode, setViewMode] = useState<
    "my-tasks" | "assigned" | "approvals"
  >("my-tasks");

  const [data, setData] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Search Text
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 300);

  // [MỚI] State lưu trữ các điều kiện lọc nâng cao (Team, Status, Priority)
  const [activeFilters, setActiveFilters] = useState<FilterState>({});

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const viewingTaskId = searchParams.get("taskId")
    ? Number(searchParams.get("taskId"))
    : null;

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [workflowTask, setWorkflowTask] = useState<{
    id: number;
    type: "APPROVE" | "REJECT";
  } | null>(null);

  const canManage =
    hasPermission("task.view.team") || hasPermission("task.approve");
  const allowedCreateTeams = getTeamsWithPermission("task.create");
  const canCreate = allowedCreateTeams.length > 0;

  const handleViewTask = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("taskId", id.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCloseTask = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("taskId");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Tổng hợp điều kiện lọc
      const condition: TaskSearchCondition = {
        search: debouncedKeyword || undefined,
        teamCode: activeFilters.teamCode, // Lọc theo Team
        status: activeFilters.status, // Lọc theo Status
        priority: activeFilters.priority?.[0] || undefined, // Lọc theo Priority (API demo nhận single, nếu array thì sửa API)
      };

      if (viewMode === "my-tasks") condition.receiverId = "me";
      else if (viewMode === "assigned") condition.senderId = "me";
      else if (viewMode === "approvals") {
        condition.senderId = "me";
        // Nếu filter status chưa chọn gì thì mặc định PENDING cho tab này
        if (!condition.status || condition.status.length === 0) {
          condition.status = ["PENDING"];
        }
      }

      const res = await taskService.searchTasks({
        page: currentPage,
        size: 10,
        condition,
        sortBy: "dueDate",
        sortDirection: "ASC",
      });
      setData(res.data);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (e) {
      console.error(e);
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedKeyword, viewMode, user, activeFilters]);

  // Reset trang về 1 khi thay đổi chế độ xem hoặc filter
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, activeFilters]);

  useEffect(() => {
    if (!isAuthLoading && user) fetchTasks();
  }, [fetchTasks, isAuthLoading, user]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await taskService.deleteTask(deletingId);
      toast.success("Đã xóa");
      setDeletingId(null);
      fetchTasks();
    } catch (e) {
      toast.error("Lỗi xóa");
    }
  };

  // Mở form tạo task: Nếu đang filter team, tự động chọn team đó
  const handleOpenCreate = () => {
    if (activeFilters.teamCode) {
      setEditingTask({ teamCode: activeFilters.teamCode } as any);
    } else {
      setEditingTask(null);
    }
    setIsCreateOpen(true);
  };

  if (isAuthLoading || !user) return null;

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý Công việc
          </h1>
          <p className="text-muted-foreground mt-1">
            Xin chào {user.firstName}
          </p>
        </div>

        {canCreate && (
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Giao việc mới
          </Button>
        )}
      </div>

      <Tabs
        defaultValue="my-tasks"
        value={viewMode}
        onValueChange={(v) => setViewMode(v as any)}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="my-tasks" className="gap-2">
              <Briefcase className="h-4 w-4" /> Việc cần làm
            </TabsTrigger>
            {canManage && (
              <TabsTrigger value="assigned" className="gap-2">
                <Send className="h-4 w-4" /> Việc đã giao
              </TabsTrigger>
            )}
            {canManage && (
              <TabsTrigger value="approvals" className="gap-2">
                <FileSignature className="h-4 w-4" /> Cần phê duyệt
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <Card className="shadow-sm border-border/50 mb-6">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên..."
                className="pl-9"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            {/* [MỚI] Sử dụng Component Filter mới */}
            <TaskFilter
              teams={user.teams || []}
              activeFilters={activeFilters}
              onApply={setActiveFilters}
            />
          </CardContent>
        </Card>

        {/* ... (Phần Table, Pagination, Dialogs bên dưới giữ nguyên) ... */}
        <Card className="shadow-sm border-border/50 overflow-hidden min-h-[500px] -py-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead className="w-[30%]">Tiêu đề</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Độ ưu tiên</TableHead>
                <TableHead>Hạn chót</TableHead>
                <TableHead>
                  {viewMode === "my-tasks" ? "Người giao" : "Người thực hiện"}
                </TableHead>
                <TableHead className="text-right">
                  {viewMode === "approvals" ? "Duyệt nhanh" : "Thao tác"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell
                      colSpan={7}
                      className="h-16 animate-pulse bg-muted/10"
                    />
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-48 text-center text-muted-foreground"
                  >
                    Không có dữ liệu công việc.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((task) => {
                  const isSender = task.senderId === user.userId;
                  const canEdit =
                    isSender ||
                    hasPermission("task.update", "TEAM", task.teamCode);
                  const canDelete =
                    isSender ||
                    hasPermission("task.delete", "TEAM", task.teamCode);
                  const canApprove =
                    isSender ||
                    hasPermission("task.approve", "TEAM", task.teamCode);

                  return (
                    <TableRow
                      key={task.id}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => handleViewTask(task.id)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{task.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{task.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {/* Hiển thị Team Code nếu chưa chọn team cụ thể */}
                          {!activeFilters.teamCode && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                              {task.teamCode}
                            </span>
                          )}
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {task.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TaskStatusBadge status={task.status} />
                      </TableCell>
                      <TableCell>
                        <TaskPriorityBadge priority={task.priority} />
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(task.dueDate), "dd/MM/yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {viewMode === "my-tasks" ? (
                          task.senderName
                        ) : (
                          <span className="font-medium text-primary">
                            {task.receiverName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {viewMode === "approvals" ? (
                          <div className="flex justify-end gap-2">
                            {canApprove && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 border-green-200"
                                  onClick={() =>
                                    setWorkflowTask({
                                      id: task.id,
                                      type: "APPROVE",
                                    })
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 border-red-200"
                                  onClick={() =>
                                    setWorkflowTask({
                                      id: task.id,
                                      type: "REJECT",
                                    })
                                  }
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <LayoutList className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewTask(task.id)}
                              >
                                Xem chi tiết
                              </DropdownMenuItem>
                              {canEdit && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingTask(task);
                                    setIsCreateOpen(true);
                                  }}
                                >
                                  Chỉnh sửa
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeletingId(task.id)}
                                >
                                  Xóa Task
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </Tabs>

      {data.length > 0 && (
        <div className="flex justify-end">
          <PaginationControl
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      <TaskFormDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setEditingTask(null);
        }}
        initialData={editingTask}
        onSuccess={fetchTasks}
      />

      <TaskDetailSheet
        taskId={viewingTaskId}
        open={!!viewingTaskId}
        onOpenChange={(open) => {
          if (!open) handleCloseTask();
        }}
        onUpdate={fetchTasks}
        currentUserId={user.clientId}
      />

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Xóa Task"
        description="Không thể hoàn tác."
        confirmLabel="Xóa"
        variant="destructive"
        onConfirm={handleDelete}
      />
      {workflowTask && (
        <TaskWorkflowDialog
          open={!!workflowTask}
          onOpenChange={() => setWorkflowTask(null)}
          taskId={workflowTask.id}
          type={workflowTask.type}
          onSuccess={() => {
            fetchTasks();
            setWorkflowTask(null);
          }}
        />
      )}
    </div>
  );
}
