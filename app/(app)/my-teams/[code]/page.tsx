"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Building2, Crown } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";
import { getAvatarInfo } from "@/utils/avatar-utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Team, TeamMember } from "@/types/teams";
import { teamService } from "@/services/team-service";
import { TeamMemberTable } from "@/components/teams/team-member-table";
import { AddMemberDialog } from "@/components/teams/add-member-dialog";
import { MyTeamDetailSkeleton } from "@/components/skeleton/my-team/my-team-detail-skeleton";

export default function MyTeamDetailPage() {
  const t = useTranslations("MyTeam");
  const params = useParams();
  const router = useRouter();
  const teamCode = params.code as string;
  const { user } = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user belongs to this team
  const userBelongsToTeam = user?.teams?.some((t) => t.teamCode === teamCode);

  // Check if user is not just a regular USER (can add members)
  const isUserRole = user?.systemRole === "USER";

  // Fetch data
  const loadData = useCallback(async () => {
    // Redirect if user doesn't belong to this team
    if (!userBelongsToTeam) {
      toast.error(t("access_denied") || "You don't have access to this team");
      router.push("/my-teams");
      return;
    }

    try {
      const [teamRes, membersRes] = await Promise.all([
        teamService.getTeamByCode(teamCode),
        teamService.getTeamMembers(teamCode),
      ]);

      setTeam(teamRes);
      setMembers(membersRes);
    } catch (error) {
      console.error(error);
      toast.error(t("load_failed") || "Cannot load team information");
      router.push("/my-teams");
    } finally {
      setIsLoading(false);
    }
  }, [teamCode, router, userBelongsToTeam, t]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [loadData, user]);

  if (isLoading) return <MyTeamDetailSkeleton />;

  if (!team) return null;

  const leader = members.find((m) => m.isLeader);

  return (
    <div className="min-h-screen bg-muted/20 p-6 space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/my-teams")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{team.teamName}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span className="font-mono bg-muted px-1.5 py-0.5 rounded border text-xs font-semibold">
              {team.teamCode}
            </span>
            <span>•</span>
            <Building2 className="h-3.5 w-3.5" /> {team.departmentCode}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("detail.total_members")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("detail.total_members_desc")}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("detail.leader")}
            </CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {leader ? (
              <div className="flex items-center gap-2">
                <div
                  className="font-bold truncate"
                  title={getAvatarInfo(leader.employee).fullName}
                >
                  {getAvatarInfo(leader.employee).fullName}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                {t("detail.leader_unassigned")}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {t("detail.leader_desc")}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("detail.department")}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.departmentCode}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("detail.department_desc")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Members Section */}
      <Card className="shadow-sm border-border/60">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 py-4 px-6">
          <div>
            <CardTitle>{t("members.title")}</CardTitle>
            <CardDescription className="mt-1">
              {t("members.description", { name: team.teamName })}
            </CardDescription>
          </div>
          {/* Only show add member button for non-USER roles */}
          {!isUserRole && (
            <AddMemberDialog teamCode={teamCode} onSuccess={loadData} />
          )}
        </CardHeader>
        <CardContent className="p-0">
          <TeamMemberTable
            members={members}
            teamCode={teamCode}
            onRefresh={loadData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
