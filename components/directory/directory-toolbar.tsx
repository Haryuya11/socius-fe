"use client";

import { useState } from "react";
import { Search, Filter, LayoutGrid, List } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchCondition } from "@/services/employee-service";
import { DepartmentSelector } from "@/components/common/department-selector";
import { TeamSelector } from "@/components/common/team-selector";

interface DirectoryToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchCondition: SearchCondition;
  onFilterApply: (condition: SearchCondition) => void;
  onFilterReset: () => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
}

export function DirectoryToolbar({
  searchValue,
  onSearchChange,
  searchCondition,
  onFilterApply,
  onFilterReset,
  viewMode,
  onViewModeChange,
}: DirectoryToolbarProps) {
  const t = useTranslations("Directory");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [tempCondition, setTempCondition] =
    useState<SearchCondition>(searchCondition);

  const activeFiltersCount =
    Object.values(searchCondition).filter(Boolean).length;

  const handleApply = () => {
    onFilterApply(tempCondition);
    setIsFilterOpen(false);
  };

  const handleInputChange = (field: keyof SearchCondition, value: string) => {
    setTempCondition((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-sm border-border/50">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            {/* Quick Search */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search_placeholder")}
                className="pl-9 h-10 bg-background border-border/50"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            {/* Filter Popover */}
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={activeFiltersCount > 0 ? "secondary" : "outline"}
                  className="h-10 gap-2 border-border/50 relative"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("filter")}</span>
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold shadow-sm">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium leading-none">
                      {t("filters.title")}
                    </h4>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                        onClick={onFilterReset}
                      >
                        {t("actions.reset")}
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="userId" className="text-xs">
                        {t("filters.email_label")}
                      </Label>
                      <Input
                        id="userId"
                        className="h-8"
                        value={tempCondition.userId}
                        onChange={(e) =>
                          handleInputChange("userId", e.target.value)
                        }
                        placeholder="user@example.com"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-xs">
                        {t("filters.department_label")}
                      </Label>
                      <DepartmentSelector
                        value={tempCondition.departmentCode || ""}
                        onChange={(val) =>
                          handleInputChange("departmentCode", val)
                        }
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-xs">
                        {t("filters.team_label")}
                      </Label>
                      <TeamSelector
                        value={tempCondition.teamCode || ""}
                        onChange={(val) => handleInputChange("teamCode", val)}
                        departmentCode={tempCondition.departmentCode}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      {t("actions.cancel")}
                    </Button>
                    <Button size="sm" onClick={handleApply}>
                      {t("actions.apply")}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onViewModeChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onViewModeChange("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
