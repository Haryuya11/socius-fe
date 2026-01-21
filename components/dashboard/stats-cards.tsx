"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  AlertOctagon,
  FileSignature,
  TrendingUp,
  Activity,
} from "lucide-react";
import { StatsCardsSkeleton } from "../skeleton/dashboard/stats-cards-skeleton";
import { useTranslations } from "next-intl";

interface StatsProps {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
  pendingReview?: number;
  role: "LEADER" | "MEMBER";
  isLoading?: boolean;
}

export function StatsCards({
  total,
  inProgress,
  completed,
  overdue,
  pendingReview = 0,
  role,
  isLoading = false,
}: StatsProps) {
  const t = useTranslations("Dashboard.stats");
  if (isLoading) return <StatsCardsSkeleton />;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isAtRisk = overdue > 0;
  const healthStatus = isAtRisk ? t("at_risk") : t("stable");
  const healthColor = isAtRisk ? "text-red-500" : "text-emerald-500";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* CARD 1: TIẾN ĐỘ CHUNG */}
      <Card className="shadow-sm border-border/60 relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("overall_progress")}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t("done_of_total", { completed, total })}
          </p>
        </CardContent>
      </Card>

      {/* CARD 2: ĐANG THỰC HIỆN */}
      <Card className="shadow-sm border-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("in_progress")}
          </CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{inProgress}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("ongoing_tasks")}
          </p>
          <div className="flex gap-1 mt-3">
            {[...Array(Math.min(inProgress, 5))].map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            ))}
            {inProgress > 5 && (
              <span className="text-[10px] text-muted-foreground leading-none">
                +
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CARD 3: THEO ROLE */}
      {role === "LEADER" ? (
        <Card
          className={`shadow-sm border-border/60 ${pendingReview > 0 ? "bg-orange-50/50 dark:bg-orange-900/10 border-orange-200" : ""}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className={`text-sm font-medium ${pendingReview > 0 ? "text-orange-700 dark:text-orange-400" : "text-muted-foreground"}`}
            >
              {t("need_review")}
            </CardTitle>
            <FileSignature
              className={`h-4 w-4 ${pendingReview > 0 ? "text-orange-600" : "text-muted-foreground"}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${pendingReview > 0 ? "text-orange-700 dark:text-orange-400" : "text-foreground"}`}
            >
              {pendingReview}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingReview > 0
                ? t("pending_from_staff")
                : t("no_pending")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm border-border/60 bg-linear-to-br from-transparent to-green-50/30 dark:to-green-900/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("achievement")}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {completed}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("tasks_completed")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* CARD 4: TRẠNG THÁI SỨC KHỎE */}
      <Card className="shadow-sm border-border/60">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("status")}
          </CardTitle>
          {isAtRisk ? (
            <AlertOctagon className="h-4 w-4 text-red-500 animate-pulse" />
          ) : (
            <Activity className="h-4 w-4 text-emerald-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${healthColor}`}>
            {healthStatus}
          </div>
          {isAtRisk ? (
            <p className="text-xs text-red-600/80 mt-1 font-medium">
              {t("overdue_alert", { count: overdue })}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              {t("stable")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
