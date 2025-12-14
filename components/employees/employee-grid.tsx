"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { getAvatarInfo } from "@/utils/avatar-utils";
import type { Employee } from "@/types/employee";

interface EmployeeGridProps {
  data: Employee[];
}

export function EmployeeGrid({ data }: EmployeeGridProps) {
  const t = useTranslations("Employees");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {data.map((emp) => {
        const { fullName, initials, avatarUrl } = getAvatarInfo(emp);
        const primaryDept = emp.departments?.find((d) => d.isPrimary);

        return (
          <Card
            key={emp.clientId}
            className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 group overflow-hidden"
          >
            <CardHeader className="pb-3 space-y-0">
              <div className="flex items-start gap-3">
                <Avatar className="h-14 w-14 border-2 border-border/50 shadow-md group-hover:border-primary/30 transition-colors">
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-cyan-500 text-white font-semibold text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                  <CardTitle
                    className="text-base truncate leading-tight"
                    title={fullName}
                  >
                    {fullName}
                  </CardTitle>
                  <CardDescription
                    className="truncate text-xs mt-0.5"
                    title={emp.userId}
                  >
                    {emp.userId}
                  </CardDescription>
                  <Badge
                    variant={
                      emp.systemRole === "SYS_ADMIN"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-[10px] h-5 px-1.5 w-fit mt-2 shadow-sm"
                  >
                    {emp.systemRole}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  <Building2 className="h-3 w-3" />
                  {t("cards.primary_dept")}
                </div>
                <div className="flex items-center gap-2 text-sm min-h-5">
                  {primaryDept ? (
                    <Badge
                      variant="outline"
                      className="font-normal bg-blue-50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200 text-xs"
                    >
                      {primaryDept.departmentName}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      {t("cards.not_assigned")}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  <Users className="h-3 w-3" />
                  {t("cards.teams_count", { count: emp.teams?.length || 0 })}
                </div>
                <div className="flex flex-wrap gap-1 min-h-6">
                  {emp.teams?.slice(0, 2).map((team) => (
                    <Badge
                      key={team.teamCode}
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-5 font-normal bg-orange-50 dark:bg-orange-500/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-200"
                    >
                      {team.teamName}
                      {team.isLeader && " ⭐"}
                    </Badge>
                  ))}
                  {emp.teams && emp.teams.length > 2 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-5 font-normal"
                    >
                      +{emp.teams.length - 2}
                    </Badge>
                  )}
                  {(!emp.teams || emp.teams.length === 0) && (
                    <span className="text-xs text-muted-foreground italic">
                      {t("cards.not_assigned")}
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 mt-2 hover:bg-primary hover:text-primary-foreground transition-colors border-border/50 bg-transparent"
              >
                {t("actions.view_profile")}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
