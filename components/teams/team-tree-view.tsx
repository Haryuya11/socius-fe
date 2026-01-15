"use client";

import { useRouter } from "next/navigation";
import { Building2, Users, ArrowRight } from "lucide-react";
import { Team } from "@/types/teams";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeamTreeViewProps {
  data: Team[];
}

export function TeamTreeView({ data }: TeamTreeViewProps) {
  const router = useRouter();

  // Gom nhóm team theo Department Code
  const groupedData = data.reduce((acc, team) => {
    if (!acc[team.departmentCode]) {
      acc[team.departmentCode] = [];
    }
    acc[team.departmentCode].push(team);
    return acc;
  }, {} as Record<string, Team[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedData).map(([deptCode, teams]) => (
        <Card
          key={deptCode}
          className="p-6 border-l-4 border-l-purple-500 shadow-sm relative overflow-hidden"
        >
          {/* Dept Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Phòng ban: {deptCode}</h3>
              <p className="text-xs text-muted-foreground">
                {teams.length} team trực thuộc
              </p>
            </div>
          </div>

          {/* Teams List (Branch) */}
          <div className="ml-5 pl-5 border-l-2 border-dashed border-border space-y-3">
            {teams.map((team) => (
              <div
                key={team.teamCode}
                className="group relative flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/50 hover:shadow-md transition-all"
              >
                {/* Connector Line */}
                <div className="absolute -left-[22px] top-1/2 w-4 h-0.5 bg-border border-b border-dashed" />

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{team.teamName}</h4>
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-5 px-1 font-mono"
                    >
                      {team.teamCode}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => router.push(`/teams/${team.teamCode}`)}
                >
                  Chi tiết <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
