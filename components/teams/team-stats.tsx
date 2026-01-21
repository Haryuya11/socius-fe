import { Users, Building2, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface TeamStatsProps {
  totalItems: number;
  uniqueDepts: number; 
}

export function TeamStats({ totalItems, uniqueDepts }: TeamStatsProps) {
  const t = useTranslations("Teams");

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Card 1: Tổng số Team */}
      <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("stats.total_teams")}
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalItems}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("stats.total_teams_desc")}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("stats.unique_departments")}
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {uniqueDepts}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("stats.unique_departments_desc")}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("stats.uptime")}
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">100%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("stats.uptime_desc")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
