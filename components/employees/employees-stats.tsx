"use client";

import { Users, Briefcase, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmployeesStatsProps {
  totalItems: number; 
  totalAdmins: number; 
}

export function EmployeesStats({
  totalItems,
  totalAdmins,
}: EmployeesStatsProps) {

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Card Tổng nhân sự - Giữ nguyên */}
      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tổng nhân sự
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Nhân viên trong hệ thống
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Quản trị viên
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAdmins}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Có quyền Admin/Manager
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Đang hoạt động
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Tài khoản đang active
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
