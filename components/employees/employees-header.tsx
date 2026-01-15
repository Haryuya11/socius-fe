"use client";

import { Users, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AddEmployeeDialog } from "@/components/employees/add-employee-dialog";

interface EmployeesHeaderProps {
  totalItems: number;
  onSuccess: () => void;
}

export function EmployeesHeader({
  totalItems,
  onSuccess,
}: EmployeesHeaderProps) {
  const t = useTranslations("Employees");

  return (
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
          <span className="text-sm font-medium">{totalItems}</span>
        </div>
        <AddEmployeeDialog onSuccess={onSuccess}>
          <Button className="gap-2 shadow-sm">
            <UserPlus className="h-4 w-4" />
            {t("add_new")}
          </Button>
        </AddEmployeeDialog>
      </div>
    </div>
  );
}
