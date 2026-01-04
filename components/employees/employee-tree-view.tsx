/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useTranslations } from "next-intl";
import { Building2, Users, Mail, Crown, Briefcase, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Employee } from "@/types/employee";

import { getAvatarInfo } from "@/utils/avatar-utils";
import { getFullImageUrl } from "@/utils/image-utils";

interface Props {
  data: Employee[];
}

export function EmployeeTreeView({ data }: Props) {
  return (
    <div className="space-y-5">
      {data.map((emp) => (
        <EmployeeNode key={emp.clientId} emp={emp} />
      ))}
    </div>
  );
}

function EmployeeNode({ emp }: { emp: Employee }) {
  const t = useTranslations("Employees");

  const { fullName, initials, avatarUrl } = getAvatarInfo(emp);
  const displayAvatarUrl = getFullImageUrl(avatarUrl);

  const deptCount = emp.departments?.length || 0;
  const teamCount = emp.teams?.length || 0;
  const isPrimary = emp.departments?.some((d) => d.isPrimary) || false;
  const isLeader = emp.teams?.some((t) => t.isLeader) || false;

  return (
    <Card className="p-6 border-l-4 border-l-primary shadow-md hover:shadow-xl transition-all duration-300 bg-linear-to-r from-card to-card/95 hover:border-l-primary/80 dark:border-border/60">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-lg">
              <AvatarImage src={displayAvatarUrl || "/placeholder.svg"} />
              <AvatarFallback className="bg-linear-to-br from-blue-500 to-cyan-500 text-white font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            {(isPrimary || isLeader) && (
              <div className="absolute -top-1 -right-1 p-1 bg-linear-to-br from-amber-400 to-yellow-500 rounded-full shadow-md border-2 border-card">
                <Crown className="h-3 w-3 text-amber-900" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h3 className="text-xl font-bold text-foreground">{fullName}</h3>
              <Badge
                variant={
                  emp.systemRole === "SYS_ADMIN" ? "destructive" : "secondary"
                }
                className="text-[10px] h-6 px-2 shadow-sm font-semibold"
              >
                <Shield className="h-3 w-3 mr-1" />
                {emp.systemRole}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-muted-foreground gap-1.5">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{emp.userId}</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-1">
              <Briefcase className="h-3 w-3 shrink-0" />
              <span className="truncate font-mono">
                {t("cards.client_id")}: {emp.clientId}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-9 hover:bg-primary hover:text-primary-foreground transition-colors border-border/50 bg-transparent dark:text-foreground"
          >
            {t("actions.view_details")}
          </Button>
          <div className="flex gap-1.5">
            <Badge variant="secondary" className="text-[10px] h-6 px-2">
              <Building2 className="h-3 w-3 mr-1" />
              {deptCount}
            </Badge>
            <Badge variant="secondary" className="text-[10px] h-6 px-2">
              <Users className="h-3 w-3 mr-1" />
              {teamCount}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-6 pl-6 border-l-2 border-primary/20 space-y-6 relative">
        {renderOrgStructure(emp, t, deptCount, teamCount)}
      </div>
    </Card>
  );
}

function renderOrgStructure(
  emp: Employee,
  t: any,
  deptCount: number,
  teamCount: number
) {
  return (
    <>
      {/* Departments Branch */}
      <div className="relative">
        <div className="absolute -left-[26px] top-4 h-0.5 w-4 bg-primary/20" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
              {t("org.departments")}
            </h4>
          </div>
          <Badge variant="outline" className="text-xs font-semibold">
            {t("cards.department_label", { count: deptCount })}
          </Badge>
        </div>
        <div className="space-y-2 ml-1">
          {emp.departments?.length > 0 ? (
            emp.departments.map((dept, index) => (
              <TreeItem
                key={dept.departmentCode}
                isLast={
                  index === emp.departments.length - 1 &&
                  (!emp.teams || emp.teams.length === 0)
                }
              >
                <div className="group flex items-center gap-2 bg-linear-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/40 dark:to-blue-900/20 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        {dept.departmentName}
                      </span>
                      {dept.isPrimary && (
                        <Badge className="text-[10px] h-5 px-1.5 bg-linear-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm">
                          <Crown className="h-2.5 w-2.5 mr-0.5" />
                          {t("org.primary")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 font-medium bg-white dark:bg-blue-950 border-blue-300 dark:border-blue-700 dark:text-blue-200"
                      >
                        {dept.roleName}
                      </Badge>
                      <span className="text-[10px] text-blue-600 dark:text-blue-300 font-mono">
                        {dept.departmentCode}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs dark:text-blue-200 dark:hover:bg-blue-800/50"
                  >
                    {t("actions.details")}
                  </Button>
                </div>
              </TreeItem>
            ))
          ) : (
            <TreeItem isLast={!emp.teams || emp.teams.length === 0}>
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/20">
                <Building2 className="h-4 w-4 text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground italic">
                  {t("cards.no_dept")}
                </span>
              </div>
            </TreeItem>
          )}
        </div>
      </div>

      {/* Teams Branch */}
      <div className="relative">
        <div className="absolute -left-[26px] top-4 h-0.5 w-4 bg-primary/20" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-linear-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
              <Users className="h-4 w-4 text-white" />
            </div>
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
              {t("org.teams")}
            </h4>
          </div>
          <Badge variant="outline" className="text-xs font-semibold">
            {t("cards.team_label", { count: teamCount })}
          </Badge>
        </div>
        <div className="space-y-2 ml-1">
          {emp.teams?.length > 0 ? (
            emp.teams.map((team, index) => (
              <TreeItem
                key={team.teamCode}
                isLast={index === emp.teams.length - 1}
              >
                <div className="group flex items-center gap-2 bg-linear-to-r from-orange-50 to-orange-50/50 dark:from-orange-900/40 dark:to-orange-900/20 px-4 py-3 rounded-lg border border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                        {team.teamName}
                      </span>
                      {team.isLeader && (
                        <div
                          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-linear-to-r from-amber-400 to-yellow-400 rounded text-[10px] font-bold text-amber-900 shadow-sm"
                          title={t("org.team_leader")}
                        >
                          <Crown className="h-3 w-3" />
                          {t("org.leader")}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 font-medium bg-white dark:bg-orange-950 border-orange-300 dark:border-orange-700 dark:text-orange-200"
                      >
                        {team.roleName}
                      </Badge>
                      <span className="text-[10px] text-orange-600 dark:text-orange-300 font-mono">
                        {team.teamCode}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs dark:text-orange-200 dark:hover:bg-orange-800/50"
                  >
                    {t("actions.details")}
                  </Button>
                </div>
              </TreeItem>
            ))
          ) : (
            <TreeItem isLast>
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/20">
                <Users className="h-4 w-4 text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground italic">
                  {t("cards.no_team")}
                </span>
              </div>
            </TreeItem>
          )}
        </div>
      </div>
    </>
  );
}

function TreeItem({
  children,
  isLast = false,
}: {
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex items-center pl-7">
      {!isLast && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/10" />
      )}
      <div className="absolute left-0 top-0 h-[50%] w-5 border-l-2 border-b-2 border-primary/20 rounded-bl-xl" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
