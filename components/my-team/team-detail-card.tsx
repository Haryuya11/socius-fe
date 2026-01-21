"use client";

import { ArrowRight, Users, Crown, Building2, Star } from "lucide-react";
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

import { TeamMember } from "@/types/teams";
import { ROLE_LABELS, RoleCode } from "@/types/roles";

interface TeamDetailCardProps {
  team: {
    teamCode: string;
    teamName: string;
    roleCode: string;
    isLeader: boolean;
    departmentCode: string;
  };
  members: TeamMember[];
  onViewDetail: (code: string) => void;
}

export function TeamDetailCard({
  team,
  members,
  onViewDetail,
}: TeamDetailCardProps) {
  const t = useTranslations("MyTeam");

  const leader = members.find((m) => m.isLeader);

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">
                {team.teamName}
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                {team.teamCode}
              </CardDescription>
            </div>
          </div>
          {team.isLeader && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-current" /> {t("leader_badge")}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Role Badge */}
        {team.roleCode && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t("your_role")}:
            </span>
            <Badge variant="outline">
              {ROLE_LABELS[team.roleCode as RoleCode] || team.roleCode}
            </Badge>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{members.length}</div>
            <div className="text-xs text-muted-foreground">
              {t("stats.members")}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Building2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div
              className="text-sm font-bold truncate"
              title={team.departmentCode}
            >
              {team.departmentCode}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("stats.department")}
            </div>
          </div>
        </div>

        {/* Leader Info */}
        {leader && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">
              <span className="text-muted-foreground">{t("leader")}:</span>{" "}
              <span className="font-medium">
                {getAvatarInfo(leader.employee).fullName}
              </span>
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <Button
          variant="outline"
          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          onClick={() => onViewDetail(team.teamCode)}
        >
          {t("view_details")} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
