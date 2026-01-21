"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";

import { Card, CardContent } from "@/components/ui/card";

import { departmentService } from "@/services/department-service";
import { teamService } from "@/services/team-service";
import { Department, DepartmentMember } from "@/types/department";
import { Team } from "@/types/teams";

import { DepartmentDetailCard } from "@/components/my-department/department-detail-card";
import { MyDepartmentSkeleton } from "@/components/skeleton/my-department/my-department-skeleton";

export default function MyDepartmentPage() {
  const t = useTranslations("MyDepartment");
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState<
    {
      dept: Department;
      members: DepartmentMember[];
      teams: Team[];
    }[]
  >([]);

  // Load data for all user's departments
  const loadData = async () => {
    if (!user?.departments || user.departments.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const results = await Promise.all(
        user.departments.map(async (dept) => {
          const [members, teamsRes] = await Promise.all([
            departmentService.getMembers(dept.departmentCode),
            teamService.fetchTeams({
              page: 1,
              size: 100,
              condition: { departmentCode: dept.departmentCode },
            }),
          ]);

          return {
            dept,
            members,
            teams: teamsRes.data,
          };
        }),
      );

      setDepartmentData(results);
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

  if (loading) return <MyDepartmentSkeleton />;

  // No departments
  if (!user?.departments || user.departments.length === 0) {
    return (
      <div className="min-h-screen bg-muted/20 p-6">
        <div className="max-w-[1600px] mx-auto">
          <Card className="shadow-sm border-dashed">
            <CardContent className="flex h-96 flex-col items-center justify-center text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
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
              <div className="h-12 w-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Building2 className="h-6 w-6 text-white" />
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
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {t("department_count", { count: user.departments.length })}
              </span>
            </div>
          </div>
        </div>

        {/* --- DEPARTMENT CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departmentData.map(({ dept, members, teams }) => (
            <DepartmentDetailCard
              key={dept.departmentCode}
              dept={dept}
              members={members}
              teams={teams}
              onViewDetail={(code) => router.push(`/my-department/${code}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
