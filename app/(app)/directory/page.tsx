"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BookUser } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaginationControl } from "@/components/ui/pagination-control";

import { Employee } from "@/types/employee";
import { employeeService, SearchCondition } from "@/services/employee-service";
import { useDebounce } from "@/hooks/use-debounce";
import { useMounted } from "@/hooks/use-mounted";

import { DirectoryHeader } from "@/components/directory/directory-header";
import { DirectoryToolbar } from "@/components/directory/directory-toolbar";
import { DirectoryStats } from "@/components/directory/directory-stats";
import { DirectoryGrid } from "@/components/directory/directory-grid";
import { DirectoryTable } from "@/components/directory/directory-table";

import { DirectoryToolbarSkeleton } from "@/components/skeleton/directory/directory-toolbar-skeleton";
import { DirectoryStatsSkeleton } from "@/components/skeleton/directory/directory-stats-skeleton";
import { DirectoryGridSkeleton } from "@/components/skeleton/directory/directory-grid-skeleton";
import { DirectoryTableSkeleton } from "@/components/skeleton/directory/directory-table-skeleton";

export default function DirectoryPage() {
  const t = useTranslations("Directory");
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
  };

  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [searchCondition, setSearchCondition] =
    useState<SearchCondition>(initialCondition);
  const [data, setData] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredTotalItems, setFilteredTotalItems] = useState(0);
  const [statsTotalItems, setStatsTotalItems] = useState(0);

  const debouncedCondition = useDebounce(searchCondition, 200);

  const updateUrl = useCallback(
    (newCondition: SearchCondition, newPage: number) => {
      const params = new URLSearchParams();
      if (newCondition.fullName) params.set("fullName", newCondition.fullName);
      if (newCondition.userId) params.set("userId", newCondition.userId);
      if (newCondition.departmentCode)
        params.set("departmentCode", newCondition.departmentCode);
      if (newCondition.teamCode) params.set("teamCode", newCondition.teamCode);
      if (newPage > 1) params.set("page", newPage.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router],
  );

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await employeeService.fetchEmployees({
        page: currentPage,
        size: 12,
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
      const allRes = await employeeService.fetchEmployees({
        page: 1,
        size: 1,
        condition: {},
      });
      setStatsTotalItems(allRes.totalItems);
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
    const emptyState: SearchCondition = {
      userId: "",
      fullName: "",
      departmentCode: "",
      teamCode: "",
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
      if (viewMode === "grid") return <DirectoryGridSkeleton />;
      return <DirectoryTableSkeleton />;
    }

    if (data.length === 0) {
      const activeFiltersCount =
        Object.values(searchCondition).filter(Boolean).length;
      return (
        <Card className="shadow-sm border-dashed">
          <CardContent className="flex h-96 flex-col items-center justify-center text-center">
            <BookUser className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg">{t("empty.title")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("empty.description")}
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
        return <DirectoryGrid data={data} />;
      case "table":
      default:
        return <DirectoryTable data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 p-6 space-y-6 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* HEADER */}
        <DirectoryHeader totalItems={filteredTotalItems} />

        {/* STATS */}
        {isFirstLoad ? (
          <DirectoryStatsSkeleton />
        ) : (
          <DirectoryStats totalItems={statsTotalItems} />
        )}

        {/* TOOLBAR */}
        {isFirstLoad ? (
          <DirectoryToolbarSkeleton />
        ) : (
          <DirectoryToolbar
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

        {/* PAGINATION */}
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
