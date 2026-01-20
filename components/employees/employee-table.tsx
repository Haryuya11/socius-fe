"use client";

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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Building2, MoreHorizontal, Users } from "lucide-react";
import { useTranslations } from "next-intl";

// UPDATE: Import hàm tiện ích chung
import { getAvatarInfo } from "@/utils/avatar-utils";
import type { Employee } from "@/types/employee";
import { getFullImageUrl } from "@/utils/image-utils";

interface EmployeeTableProps {
  data: Employee[];
}

export function EmployeeTable({ data }: EmployeeTableProps) {
  const t = useTranslations("Employees");

  return (
    <Card className="shadow-sm border-border/50 overflow-hidden -py-6">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
            <TableHead className="w-[320px] font-semibold pl-6">
              {t("table.employee")}
            </TableHead>

            <TableHead className="font-semibold">
              {t("table.system_role")}
            </TableHead>
            <TableHead className="font-semibold">
              {t("table.departments")}
            </TableHead>
            <TableHead className="font-semibold">{t("table.teams")}</TableHead>

            <TableHead className="text-right font-semibold pr-6">
              {t("table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((emp) => {
            const { fullName, initials, avatarUrl } = getAvatarInfo(emp);
            const displayAvatarUrl = getFullImageUrl(avatarUrl);

            return (
              <TableRow
                key={emp.clientId}
                className="hover:bg-muted/40 transition-colors border-border/50"
              >
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-border/50 shadow-sm">
                      <AvatarImage
                        src={displayAvatarUrl || "/placeholder.svg"}
                      />
                      <AvatarFallback className="bg-linear-to-br from-blue-500 to-cyan-500 text-white font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm text-foreground">
                        {fullName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                        {emp.userId}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      emp.systemRole === "SYS_ADMIN"
                        ? "destructive"
                        : "secondary"
                    }
                    className="font-medium shadow-sm"
                  >
                    {emp.systemRole}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {emp.departments?.length > 0 ? (
                      emp.departments.map((dept) => (
                        <Badge
                          key={dept.departmentCode}
                          variant="outline"
                          className="font-normal bg-blue-50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200"
                        >
                          <Building2 className="mr-1 h-3 w-3" />
                          {dept.departmentName}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs italic">
                        {t("cards.not_assigned")}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                    {emp.teams?.length > 0 ? (
                      emp.teams.map((team) => (
                        <Badge
                          key={team.teamCode}
                          variant="outline"
                          className="font-normal bg-orange-50 dark:bg-orange-500/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-200"
                        >
                          <Users className="mr-1 h-3 w-3" />
                          {team.teamName}
                          {team.isLeader && (
                            <span className="ml-1" title={t("org.team_leader")}>
                              ⭐
                            </span>
                          )}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs italic">
                        {t("cards.not_assigned")}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* THÊM pr-6 VÀO ĐÂY (Cột cuối - Body) */}
                <TableCell className="text-right pr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-muted/50"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="cursor-pointer">
                        {t("actions.view_profile")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        {t("actions.edit_details")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}