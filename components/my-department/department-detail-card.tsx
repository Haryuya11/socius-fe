"use client";

import {
  ArrowRight,
  Building2,
  Crown,
  Users,
  Layers,
  Star,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { getAvatarInfo } from "@/utils/avatar-utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Department, DepartmentMember } from "@/types/department";
import { Team } from "@/types/teams";
import { ROLE_LABELS, RoleCode } from "@/types/roles";

interface DepartmentDetailCardProps {
  dept: Department;
  members: DepartmentMember[];
  teams: Team[];
  onViewDetail: (code: string) => void;
}

export function DepartmentDetailCard({
  dept,
  members,
  teams,
  onViewDetail,
}: DepartmentDetailCardProps) {
  const t = useTranslations("MyDepartment");

  const director = members.find((m) => m.roleCode === "DEPT_DIR");
  const managerCount = members.filter((m) => m.roleCode === "DEPT_MGR").length;

  return (
    <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">
                {dept.departmentName}
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                {dept.departmentCode}
              </CardDescription>
            </div>
          </div>
          {dept.isPrimary && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-current" /> {t("primary")}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Role Badge */}
        {dept.roleCode && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t("your_role")}:
            </span>
            <Badge variant="outline">
              {ROLE_LABELS[dept.roleCode as RoleCode] || dept.roleCode}
            </Badge>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{members.length}</div>
            <div className="text-xs text-muted-foreground">
              {t("stats.members")}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Crown className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
            <div className="text-lg font-bold">{managerCount}</div>
            <div className="text-xs text-muted-foreground">
              {t("stats.managers")}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Layers className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{teams.length}</div>
            <div className="text-xs text-muted-foreground">
              {t("stats.teams")}
            </div>
          </div>
        </div>

        {/* Director Info */}
        {director && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">
              <span className="text-muted-foreground">{t("director")}:</span>{" "}
              <span className="font-medium">
                {getAvatarInfo(director.employee).fullName}
              </span>
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <Button
          variant="outline"
          className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          onClick={() => onViewDetail(dept.departmentCode)}
        >
          {t("view_details")} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
