"use client";

import { BookUser } from "lucide-react";
import { useTranslations } from "next-intl";

interface DirectoryHeaderProps {
  totalItems: number;
}

export function DirectoryHeader({ totalItems }: DirectoryHeaderProps) {
  const t = useTranslations("Directory");

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/50">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <BookUser className="h-6 w-6 text-white" />
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
          <BookUser className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {t("total_count", { count: totalItems })}
          </span>
        </div>
      </div>
    </div>
  );
}
