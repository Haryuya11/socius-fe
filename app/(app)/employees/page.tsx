"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaginationControl } from "@/components/ui/pagination-control";

// Types & Services
import { Employee } from "@/types/employee";
import { employeeService, SearchCondition } from "@/services/employee-service";
import { useDebounce } from "@/hooks/use-debounce";
import { useMounted } from "@/hooks/use-mounted";

// Components
import { EmployeesHeader } from "@/components/employees/employees-header";
import { EmployeesToolbar } from "@/components/employees/employees-toolbar";
import { EmployeesStats } from "@/components/employees/employees-stats";

// Views
import { EmployeeGrid } from "@/components/employees/employee-grid";
import { EmployeeTable } from "@/components/employees/employee-table";
import { EmployeeTreeView } from "@/components/employees/employee-tree-view";

// Skeletons
import { EmployeesToolbarSkeleton } from "@/components/skeleton/employees/employees-toolbar-skeleton";
import { EmployeeTreeSkeleton } from "@/components/skeleton/employees/employee-tree-skeleton";
import { TeamStatsSkeleton } from "@/components/skeleton/teams/team-stats-skeleton"; // Tái sử dụng stats skeleton
import { EmployeeGridSkeleton } from "@/components/skeleton/employees/employee-grid";
import { EmployeeTableSkeleton } from "@/components/skeleton/employees/employee-table";

export default function EmployeesPage() {
  const t = useTranslations("Employees");
  const mounted = useMounted();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- STATE ---
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialCondition: SearchCondition = {
    userId: searchParams.get("userId") || "",
    firstName: searchParams.get("firstName") || "",
    lastName: searchParams.get("lastName") || "",
    systemRole: searchParams.get("systemRole") || "",
  };

  const [viewMode, setViewMode] = useState<"table" | "grid" | "tree">("table");
  const [searchCondition, setSearchCondition] =
    useState<SearchCondition>(initialCondition);
  const [data, setData] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);

  const debouncedCondition = useDebounce(searchCondition, 400);

  // --- LOGIC ---
  const updateUrl = useCallback(
    (newCondition: SearchCondition, newPage: number) => {
      const params = new URLSearchParams();
      if (newCondition.firstName)
        params.set("firstName", newCondition.firstName);
      if (newCondition.userId) params.set("userId", newCondition.userId);
      if (newCondition.lastName) params.set("lastName", newCondition.lastName);
      if (newCondition.systemRole)
        params.set("systemRole", newCondition.systemRole);
      if (newPage > 1) params.set("page", newPage.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await employeeService.fetchEmployees({
        page: currentPage,
        size: 10,
        condition: debouncedCondition,
      });
      setData(res.data);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (error) {
      console.error("Failed to fetch employees", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedCondition]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await employeeService.fetchEmployees({
        page: 1,
        size: 1,
        condition: {
          firstName: "",
          lastName: "",
          userId: "",
          systemRole: "SYS_ADMIN",
        },
      });
      setTotalAdmins(res.totalItems);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchEmployees();
      fetchStats();
    }
  }, [fetchEmployees, fetchStats, mounted]);

  // --- HANDLERS ---
  const handleSearchChange = (val: string) => {
    const newCond = { ...searchCondition, firstName: val };
    setSearchCondition(newCond);
    setCurrentPage(1);
    updateUrl(newCond, 1);
  };

  const handleFilterApply = (condition: SearchCondition) => {
    setSearchCondition(condition);
    setCurrentPage(1);
    updateUrl(condition, 1);
  };

  const handleFilterReset = () => {
    const emptyState = {
      userId: "",
      firstName: "",
      lastName: "",
      systemRole: "",
    };
    setSearchCondition(emptyState);
    setCurrentPage(1);
    updateUrl(emptyState, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(searchCondition, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- RENDER HELPERS ---
  const renderContent = () => {
    if (isLoading) {
      if (viewMode === "grid") return <EmployeeGridSkeleton />;
      if (viewMode === "tree") return <EmployeeTreeSkeleton />;
      return <EmployeeTableSkeleton />;
    }

    if (data.length === 0) {
      const activeFiltersCount =
        Object.values(searchCondition).filter(Boolean).length;
      return (
        <Card className="shadow-sm border-dashed">
          <CardContent className="flex h-96 flex-col items-center justify-center text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg">{t("empty.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {activeFiltersCount > 0
                ? t("empty.desc_filtered")
                : t("empty.desc_default")}
            </p>
            {activeFiltersCount > 0 && (
              <Button
                variant="link"
                onClick={handleFilterReset}
                className="mt-2 text-primary"
              >
                {t("actions.clear_filters")}
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    switch (viewMode) {
      case "grid":
        return <EmployeeGrid data={data} />;
      case "tree":
        return (
          <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[800px]">
              <EmployeeTreeView data={data} />
            </div>
          </div>
        );
      case "table":
      default:
        return <EmployeeTable data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 p-6 space-y-6 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* HEADER */}
        <EmployeesHeader totalItems={totalItems} onSuccess={fetchEmployees} />

        {/* STATS */}
        {isLoading ? (
          <TeamStatsSkeleton />
        ) : (
          <EmployeesStats totalItems={totalItems} totalAdmins={totalAdmins} />
        )}

        {/* TOOLBAR */}
        {isLoading ? (
          <EmployeesToolbarSkeleton />
        ) : (
          <EmployeesToolbar
            searchValue={searchCondition.firstName || ""}
            onSearchChange={handleSearchChange}
            searchCondition={searchCondition}
            onFilterApply={handleFilterApply}
            onFilterReset={handleFilterReset}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}

        {/* CONTENT */}
        {renderContent()}

        {/* PAGINATION */}
        {!isLoading && data.length > 0 && (
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
