"use client";

import { Users, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface DirectoryStatsProps {
  totalItems: number;
}

export function DirectoryStats({ totalItems }: DirectoryStatsProps) {
  const t = useTranslations("Directory");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("stats.total_people")}
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("stats.total_people_desc")}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("stats.organization")}
          </CardTitle>
          <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Socius</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("stats.organization_desc")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
