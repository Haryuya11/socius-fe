"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaginationControl } from "@/components/ui/pagination-control";

import { Employee } from "@/types/employee";
import { employeeService, SearchCondition } from "@/services/employee-service";
import { useDebounce } from "@/hooks/use-debounce";
import { useMounted } from "@/hooks/use-mounted";

import { EmployeesHeader } from "@/components/employees/employees-header";
import { EmployeesToolbar } from "@/components/employees/employees-toolbar";
import { EmployeesStats } from "@/components/employees/employees-stats";
import { EmployeeGrid } from "@/components/employees/employee-grid";
import { EmployeeTable } from "@/components/employees/employee-table";
import { EmployeeTreeView } from "@/components/employees/employee-tree-view";

import { EmployeesToolbarSkeleton } from "@/components/skeleton/employees/employees-toolbar-skeleton";
import { EmployeeTreeSkeleton } from "@/components/skeleton/employees/employee-tree-skeleton";
import { TeamStatsSkeleton } from "@/components/skeleton/teams/team-stats-skeleton";
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
    fullName: searchParams.get("fullName") || "",
    departmentCode: searchParams.get("departmentCode") || "",
    teamCode: searchParams.get("teamCode") || "",
    systemRole: searchParams.get("systemRole") || "",
  };

  const [viewMode, setViewMode] = useState<"table" | "grid" | "tree">("table");
  const [searchCondition, setSearchCondition] =
    useState<SearchCondition>(initialCondition);
  const [data, setData] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredTotalItems, setFilteredTotalItems] = useState(0);
  const [statsTotalItems, setStatsTotalItems] = useState(0);
  const [statsTotalAdmins, setStatsTotalAdmins] = useState(0);

  const debouncedCondition = useDebounce(searchCondition, 200);

  const updateUrl = useCallback(
    (newCondition: SearchCondition, newPage: number) => {
      const params = new URLSearchParams();
      if (newCondition.fullName) params.set("fullName", newCondition.fullName);
      if (newCondition.userId) params.set("userId", newCondition.userId);
      if (newCondition.departmentCode)
        params.set("departmentCode", newCondition.departmentCode);
      if (newCondition.teamCode) params.set("teamCode", newCondition.teamCode);
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
      setFilteredTotalItems(res.totalItems);
    } catch (error) {
      console.error("Failed to fetch employees", error);
      setData([]);
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  }, [currentPage, debouncedCondition]);

  const fetchStats = useCallback(async () => {
    try {
      const [allRes, adminRes] = await Promise.all([
        employeeService.fetchEmployees({
          page: 1,
          size: 1,
          condition: {},
        }),
        employeeService.fetchEmployees({
          page: 1,
          size: 1,
          condition: { systemRole: "SYS_ADMIN" },
        }),
      ]);

      setStatsTotalItems(allRes.totalItems);
      setStatsTotalAdmins(adminRes.totalItems);
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

  const handleSearchChange = (val: string) => {
    const newCond = { ...searchCondition, fullName: val };
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
      fullName: "",
      departmentCode: "",
      teamCode: "",
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

  const renderContent = () => {
    if (isLoading) {
      if (viewMode === "grid") return <EmployeeGridSkeleton />;
      if (viewMode === "tree") return <EmployeeTreeSkeleton />;
      return <EmployeeTableSkeleton />;
    }

    if (data.length === 0) {
      // ... (Giữ nguyên logic render empty)
      const activeFiltersCount =
        Object.values(searchCondition).filter(Boolean).length;
      return (
        <Card className="shadow-sm border-dashed">
          <CardContent className="flex h-96 flex-col items-center justify-center text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg">{t("empty.title")}</h3>
            {/* ... */}
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
        {/* HEADER: Dùng filteredTotalItems để hiện số kết quả tìm thấy */}
        <EmployeesHeader
          totalItems={filteredTotalItems}
          onSuccess={fetchEmployees}
        />

        {/* STATS: Dùng statsTotalItems và statsTotalAdmins (Số liệu gốc) */}
        {isFirstLoad ? (
          <TeamStatsSkeleton />
        ) : (
          <EmployeesStats
            totalItems={statsTotalItems}
            totalAdmins={statsTotalAdmins}
          />
        )}

        {/* TOOLBAR */}
        {isFirstLoad ? (
          <EmployeesToolbarSkeleton />
        ) : (
          <EmployeesToolbar
            searchValue={searchCondition.fullName || ""}
            onSearchChange={handleSearchChange}
            searchCondition={searchCondition}
            onFilterApply={handleFilterApply}
            onFilterReset={handleFilterReset}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        )}

        {/* CONTENT */}
        <div className="min-h-[400px]">{renderContent()}</div>

        {/* PAGINATION: Dùng filteredTotalItems để tính số trang */}
        {!isLoading && data.length > 0 && (
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTotalItems}
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
