"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Crown,
  Users,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";
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

import { departmentService } from "@/services/department-service";
import { teamService } from "@/services/team-service";
import { Department, DepartmentMember } from "@/types/department";
import { Team } from "@/types/teams";

import { DepartmentMemberTable } from "@/components/departments/department-member-table";
import { DepartmentDetailSkeleton } from "@/components/skeleton/departments/department-detail-skeleton";

export default function MyDepartmentDetailPage() {
  const t = useTranslations("MyDepartment");
  const tDept = useTranslations("Departments");
  const params = useParams();
  const deptCode = params.code as string;
  const router = useRouter();
  const { user } = useAuth();

  const [dept, setDept] = useState<Department | null>(null);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user belongs to this department
  const userBelongsToDept = user?.departments?.some(
    (d) => d.departmentCode === deptCode,
  );

  const loadData = async () => {
    // Redirect if user doesn't belong to this department
    if (!userBelongsToDept) {
      toast.error(
        t("access_denied") || "You don't have access to this department",
      );
      router.push("/my-department");
      return;
    }

    try {
      const [d, m, teamsRes] = await Promise.all([
        departmentService.getDepartmentByCode(deptCode),
        departmentService.getMembers(deptCode),
        teamService.fetchTeams({
          page: 1,
          size: 100,
          condition: { departmentCode: deptCode },
        }),
      ]);

      setDept(d);
      setMembers(m);
      setTeams(teamsRes.data);
    } catch (e) {
      console.error(e);
      toast.error(t("load_failed") || "Cannot load department information");
      router.push("/my-department");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptCode, user]);

  if (loading) return <DepartmentDetailSkeleton />;

  if (!dept) return null;

  // Find Director and count Managers
  const director = members.find((m) => m.roleCode === "DEPT_DIR");
  const managerCount = members.filter((m) => m.roleCode === "DEPT_MGR").length;

  return (
    <div className="min-h-screen bg-muted/20 p-6 space-y-6 animate-in fade-in">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/my-department")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {dept.departmentName}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span className="font-mono bg-muted px-1.5 py-0.5 rounded border text-xs font-semibold">
              {dept.departmentCode}
            </span>
            <span>•</span>
            <Building2 className="h-3.5 w-3.5" />{" "}
            {tDept("detail.header_subtitle")}
          </div>
        </div>
      </div>

      {/* --- INFO CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Staff */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {tDept("detail.total_staff.title")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tDept("detail.total_staff.desc", { managerCount })}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Director */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {tDept("detail.director.title")}
            </CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {director ? (
              <div className="flex items-center gap-2">
                <div
                  className="font-bold truncate"
                  title={getAvatarInfo(director.employee).fullName}
                >
                  {getAvatarInfo(director.employee).fullName}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                {tDept("detail.director_unassigned")}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {tDept("detail.director.desc")}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Teams Count */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {tDept("detail.teams_count.title")}
            </CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {teams.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tDept("detail.teams_count.desc")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- TEAMS LIST SECTION --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/90">
          <Layers className="h-5 w-5 text-purple-600" /> {t("teams.title")}
        </h3>

        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-muted/30 border border-dashed rounded-lg text-muted-foreground">
            <Layers className="h-8 w-8 mb-2 opacity-50" />
            <p>{t("teams.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map((team) => {
              // Only restrict for USER role, other roles can view all teams
              const isUserRole = user?.systemRole === "USER";
              const userInTeam = user?.teams?.some(
                (t) => t.teamCode === team.teamCode,
              );
              const canViewTeam = !isUserRole || userInTeam;

              return (
                <Card
                  key={team.teamCode}
                  className={`border-l-4 border-l-purple-500 transition-all ${
                    canViewTeam
                      ? "group hover:shadow-md hover:border-purple-400/50 cursor-pointer"
                      : "opacity-70"
                  }`}
                  onClick={
                    canViewTeam
                      ? () => router.push(`/teams/${team.teamCode}`)
                      : undefined
                  }
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle
                      className="text-base font-semibold line-clamp-1"
                      title={team.teamName}
                    >
                      {team.teamName}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs flex items-center gap-1">
                      <span className="bg-muted px-1 rounded">
                        {team.teamCode}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2 pb-4 px-4">
                    {canViewTeam ? (
                      <div className="text-xs font-medium text-muted-foreground group-hover:text-purple-600 flex items-center gap-1 transition-colors ml-auto">
                        {t("teams.view_details")}{" "}
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground ml-auto">
                        {t("teams.not_member")}
                      </div>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MEMBERS SECTION --- */}
      <Card className="shadow-sm border-border/60">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 py-4 px-6">
          <div>
            <CardTitle>{t("members.title")}</CardTitle>
            <CardDescription className="mt-1">
              {t("members.description", { name: dept.departmentName })}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DepartmentMemberTable
            members={members}
            deptCode={deptCode}
            onRefresh={loadData}
          />
        </CardContent>
      </Card>
    </div>
  );
}
