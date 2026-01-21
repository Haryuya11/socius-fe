"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent } from "@/components/ui/card";

import { teamService } from "@/services/team-service";
import { TeamMember } from "@/types/teams";

import { TeamDetailCard } from "@/components/my-team/team-detail-card";
import { MyTeamSkeleton } from "@/components/skeleton/my-team/my-team-skeleton";

export default function MyTeamPage() {
  const t = useTranslations("MyTeam");
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<
    {
      teamCode: string;
      teamName: string;
      roleCode: string;
      isLeader: boolean;
      departmentCode: string;
      members: TeamMember[];
    }[]
  >([]);

  // Load data for all user's teams
  const loadData = async () => {
    if (!user?.teams || user.teams.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const results = await Promise.all(
        user.teams.map(async (team) => {
          const [teamInfo, members] = await Promise.all([
            teamService.getTeamByCode(team.teamCode),
            teamService.getTeamMembers(team.teamCode),
          ]);

          return {
            teamCode: team.teamCode,
            teamName: team.teamName,
            roleCode: team.roleCode,
            isLeader: team.isLeader,
            departmentCode: teamInfo.departmentCode,
            members,
          };
        }),
      );

      setTeamData(results);
    } catch (e) {
      console.error(e);
      toast.error(t("load_failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return <MyTeamSkeleton />;

  // No teams
  if (!user?.teams || user.teams.length === 0) {
    return (
      <div className="min-h-screen bg-muted/20 p-6">
        <div className="max-w-[1600px] mx-auto">
          <Card className="shadow-sm border-dashed">
            <CardContent className="flex h-96 flex-col items-center justify-center text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg">{t("empty.title")}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {t("empty.description")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 p-6 space-y-6 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/50">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
                  {t("title")}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("subtitle")}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border/50">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {t("team_count", { count: user.teams.length })}
              </span>
            </div>
          </div>
        </div>

        {/* --- TEAM CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamData.map((team) => (
            <TeamDetailCard
              key={team.teamCode}
              team={team}
              members={team.members}
              onViewDetail={(code) => router.push(`/my-teams/${code}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
