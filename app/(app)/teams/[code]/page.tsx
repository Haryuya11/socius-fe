"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users, Building2, Crown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { Team, TeamMember } from "@/types/teams";
import { teamService } from "@/services/team-service";
import { TeamMemberTable } from "@/components/teams/team-member-table";
import { AddMemberDialog } from "@/components/teams/add-member-dialog";
import { usePermission } from "@/hooks/use-permission";

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teamCode = params.code as string;

  const { hasPermission } = usePermission();

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const canAddMember = hasPermission("team.member.add", "TEAM", teamCode);

  const loadData = useCallback(async () => {
    try {
      const [teamRes, membersRes] = await Promise.all([
        teamService.getTeamByCode(teamCode),
        teamService.getTeamMembers(teamCode),
      ]);

      setTeam(teamRes);
      setMembers(membersRes);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải thông tin team");
      router.push("/teams");
    } finally {
      setIsLoading(false);
    }
  }, [teamCode, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!team) return null;

  const leader = members.find((m) => m.isLeader);

  return (
    <div className="min-h-screen bg-muted/20 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{team.teamName}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono bg-muted px-1 rounded">
              {team.teamCode}
            </span>
            <span>•</span>
            <Building2 className="h-3 w-3" /> {team.departmentCode}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng thành viên
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Leader</CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {leader ? (
              <div className="flex items-center gap-2">
                <div className="font-bold">
                  {leader.employee.firstName} {leader.employee.lastName}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                Chưa có Leader
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phòng ban</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.departmentCode}</div>
          </CardContent>
        </Card>
      </div>

      {/* Members Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Thành viên nhóm</CardTitle>
            <CardDescription>
              Quản lý danh sách thành viên và vai trò.
            </CardDescription>
          </div>
          {canAddMember && (
            <AddMemberDialog teamCode={teamCode} onSuccess={loadData} />
          )}
        </CardHeader>
        <CardContent>
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
