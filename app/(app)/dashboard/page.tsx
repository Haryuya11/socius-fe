/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useTranslations, useLocale } from "next-intl";
import { vi, enUS } from "date-fns/locale";

import { useAuth } from "@/hooks/use-auth";
import { usePermission } from "@/hooks/use-permission";
import { taskService } from "@/services/task-service";
import { Task } from "@/types/task";

// Components
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar";
import { TaskOverviewChart } from "@/components/dashboard/task-overview-chart";
import { UrgentTasks } from "@/components/dashboard/urgent-tasks";
import { DashboardHeaderSkeleton } from "@/components/skeleton/dashboard/header-skeleton";

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { hasPermission } = usePermission();
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const dateLocale = locale === "vi" ? vi : enUS;

  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    pendingReview: 0,
  });
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);

  // Khởi tạo là true để Skeleton hiện ngay lập tức
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Tính quyền
  const isLeader = hasPermission("task.approve");

  // Logic gọi API
  useEffect(() => {
    // Chỉ bắt đầu gọi API khi đã xác định được user
    if (isAuthLoading || !user) return;

    let isMounted = true; // Flag để tránh update state khi component đã unmount

    const fetchDashboardData = async () => {
      // Lưu ý: Không set lại setIsDataLoading(true) ở đây nữa
      // vì mặc định nó đã là true rồi, tránh gây re-render thừa.

      try {
        const [allTasksRes, urgentRes, pendingRes] = await Promise.all([
          taskService.searchTasks({
            page: 1,
            size: 1000,
            condition: { receiverId: "me" },
          }),
          taskService.searchTasks({
            page: 1,
            size: 5,
            condition: { receiverId: "me", status: ["IN_PROGRESS", "OVERDUE"] },
            sortBy: "dueDate",
            sortDirection: "ASC",
          }),
          isLeader
            ? taskService.searchTasks({
                page: 1,
                size: 100,
                condition: { senderId: "me", status: ["PENDING"] },
              })
            : Promise.resolve({ data: [], totalItems: 0 }),
        ]);

        if (isMounted) {
          const myTasks = allTasksRes.data;
          const total = allTasksRes.totalItems;
          const inProgress = myTasks.filter(
            (t) => t.status === "IN_PROGRESS",
          ).length;
          const completed = myTasks.filter(
            (t) => t.status === "APPROVED",
          ).length;
          const overdue = myTasks.filter((t) => t.status === "OVERDUE").length;

          setStats({
            total,
            inProgress,
            completed,
            overdue,
            pendingReview: isLeader ? (pendingRes as any).totalItems : 0,
          });

          setUrgentTasks(urgentRes.data);
        }
      } catch (error) {
        console.error("Dashboard Load Error", error);
      } finally {
        if (isMounted) {
          // Chỉ tắt loading khi mọi thứ đã xong hoàn toàn
          setIsDataLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user, isAuthLoading, isLeader]);

  const isPageLoading = isAuthLoading || isDataLoading;


  const chartData = [
    { name: t("charts.in_progress"), total: stats.inProgress, color: "#3b82f6" },
    { name: t("charts.pending"), total: stats.pendingReview, color: "#f97316" },
    { name: t("charts.completed"), total: stats.completed, color: "#22c55e" },
    { name: t("charts.overdue"), total: stats.overdue, color: "#ef4444" },
  ];

  return (
    <div className="p-6 space-y-6 bg-muted/5 min-h-screen animate-in fade-in duration-500">
      {isPageLoading ? (
        <DashboardHeaderSkeleton />
      ) : (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h2>
            {/* Dùng Optional Chaining (?) để tránh lỗi nếu user chưa kịp load */}
            <p className="text-muted-foreground mt-1">
              {t("greeting", { name: user?.firstName })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(), "EEEE, d MMMM yyyy", { locale: dateLocale })}
            </p>
          </div>
        </div>
      )}

      <StatsCards
        total={stats.total}
        inProgress={stats.inProgress}
        completed={stats.completed}
        overdue={stats.overdue}
        pendingReview={stats.pendingReview}
        role={isLeader ? "LEADER" : "MEMBER"}
        isLoading={isPageLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 h-full flex flex-col">
          <TaskOverviewChart data={chartData} isLoading={isPageLoading} />
          <div className="flex-1">
            <UrgentTasks tasks={urgentTasks} isLoading={isPageLoading} />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <DashboardCalendar isPageLoading={isPageLoading} />
        </div>
      </div>
    </div>
  );
}
