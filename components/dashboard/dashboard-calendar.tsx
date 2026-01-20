"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarIcon, Loader2, MapPin, Clock } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import { taskService } from "@/services/task-service";
import { Task, TaskStatus } from "@/types/task";
import { useAuth } from "@/hooks/use-auth";
import { CalendarSkeleton } from "../skeleton/dashboard/calendar-skeleton";

export function DashboardCalendar({
  isPageLoading = false,
}: {
  isPageLoading?: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInternalLoading, setIsInternalLoading] = useState(false);

  useEffect(() => {
    const fetchTasksByDate = async () => {
      if (!date || !user) return;
      setIsInternalLoading(true);
      try {
        const res = await taskService.searchTasks({
          page: 1,
          size: 100,
          condition: {
            receiverId: "me",
            dueDateFrom: startOfDay(date).toISOString(),
            dueDateTo: endOfDay(date).toISOString(),
          },
          sortBy: "priority",
          sortDirection: "DESC",
        });
        setTasks(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsInternalLoading(false);
      }
    };
    fetchTasksByDate();
  }, [date, user]);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "IN_PROGRESS":
        return "after:bg-blue-500";
      case "PENDING":
        return "after:bg-orange-500";
      case "APPROVED":
        return "after:bg-green-500";
      case "OVERDUE":
        return "after:bg-red-500";
      case "REJECTED":
        return "after:bg-rose-700";
      default:
        return "after:bg-gray-500";
    }
  };

  const handleTaskClick = (taskId: number) => {
    router.push(`/tasks?taskId=${taskId}`);
  };

  if (isPageLoading) return <CalendarSkeleton />;

  return (
    <Card className="w-full h-fit shadow-sm border-border/60 flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" /> Lịch công
          việc
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 pb-2 flex justify-center">
        <div className="border-b border-border/50 pb-4 w-full flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="p-0"
            required
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-3 px-4 pt-4 pb-4 bg-muted/10 flex-1">
        <div className="flex w-full items-center justify-between">
          <div className="text-sm font-medium text-foreground">
            {date ? format(date, "EEEE, dd/MM/yyyy") : "Chọn ngày"}
          </div>
          <Badge variant="secondary" className="text-xs font-normal">
            {tasks.length} task
          </Badge>
        </div>

        <ScrollArea className="h-60 w-full pr-3">
          <div className="flex w-full flex-col gap-2">
            {isInternalLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                Không có công việc nào hạn chót hôm nay.
              </div>
            ) : (
              tasks.map((task) => (
                <HoverCard key={task.id} openDelay={200} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <div
                      onClick={() => handleTaskClick(task.id)}
                      className={`relative rounded-md p-3 pl-6 text-sm bg-background border border-border hover:border-primary/50 transition-colors cursor-pointer group after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full ${getStatusColor(task.status)}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium truncate pr-2 group-hover:text-primary transition-colors">
                          {task.title}
                        </div>
                        {task.priority === "HIGH" && (
                          <span
                            className="flex h-2 w-2 rounded-full bg-red-500 shrink-0 mt-1"
                            title="Ưu tiên cao"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(task.dueDate), "HH:mm")}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {task.teamCode}
                        </div>
                      </div>
                    </div>
                  </HoverCardTrigger>

                  <HoverCardContent className="w-80" align="start" side="right">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-semibold leading-none">
                          {task.title}
                        </h4>
                        {task.priority === "HIGH" && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] h-5 px-1"
                          >
                            Cao
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {task.description || "Không có mô tả chi tiết."}
                      </p>

                      <Separator />

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {task.senderName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">
                              Người giao
                            </span>
                            <span className="font-medium">
                              {task.senderName}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="text-muted-foreground block text-[10px] mb-0.5">
                            Trạng thái
                          </span>
                          <Badge
                            variant="outline"
                            className="w-fit text-[10px] px-1 py-0 h-5 font-normal"
                          >
                            {task.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        <Clock className="h-3 w-3" />
                        <span>
                          Deadline:{" "}
                          {format(new Date(task.dueDate), "HH:mm - dd/MM/yyyy")}
                        </span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))
            )}
          </div>
        </ScrollArea>

        <Button
          variant="ghost"
          className="w-full text-xs text-muted-foreground h-8 mt-1"
          onClick={() => router.push("/tasks")}
        >
          Xem tất cả
        </Button>
      </CardFooter>
    </Card>
  );
}
