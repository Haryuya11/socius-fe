/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, Search, LayoutGrid, List, X } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { usePermission } from "@/hooks/use-permission";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PaginationControl } from "@/components/ui/pagination-control";

// Skeletons
import { DepartmentGridSkeleton } from "@/components/skeleton/departments/department-grid-skeleton";
import { DepartmentsToolbarSkeleton } from "@/components/skeleton/departments/departments-toolbar-skeleton";
import { DepartmentStatsSkeleton } from "@/components/skeleton/departments/department-stats-skeleton";

// Components
import { DepartmentDialog } from "@/components/departments/department-dialog";
import { DepartmentTable } from "@/components/departments/department-table";
import { DepartmentGrid } from "@/components/departments/department-grid";
import { departmentService } from "@/services/department-service";
import { useTranslations } from "next-intl";
import { Department } from "@/types/department";

export default function DepartmentsPage() {
  const t = useTranslations("Departments");
  const { hasPermission } = usePermission();

  const [data, setData] = useState<Department[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Pagination & Count
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredTotalItems, setFilteredTotalItems] = useState(0);
  const [statsTotalItems, setStatsTotalItems] = useState(0);

  // Filter
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Loading States
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 1. Fetch Data (Grid/Table) - Có Filter
  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const res = await departmentService.fetchDepartments({
        page: currentPage,
        size: viewMode === "grid" ? 12 : 20,
        condition: { departmentName: debouncedSearch || undefined },
      });
      setData(res.data);
      setTotalPages(res.totalPages);
      setFilteredTotalItems(res.totalItems);
    } catch (e) {
      console.error(e);
      toast.error(t("delete_failed") || "Failed to load departments");
    } finally {
      setIsLoadingData(false);
    }
  }, [currentPage, debouncedSearch, viewMode]);

  // 2. Fetch Stats (Overview) - Không Filter
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      // Gọi API với condition rỗng để lấy tổng số lượng
      const res = await departmentService.fetchDepartments({
        page: 1,
        size: 1, // Chỉ cần lấy meta data
        condition: {},
      });
      setStatsTotalItems(res.totalItems);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // --- EFFECTS ---

  // Initial Load & Refresh Stats
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Data Load when params change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // --- HANDLERS ---

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await departmentService.deleteDepartment(deleteId);
      toast.success("Đã xóa phòng ban");

      // Refresh cả Data và Stats sau khi xóa
      fetchData();
      fetchStats();
    } catch (error: any) {
      toast.error(t("delete_failed") || "Unable to delete department");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const refreshAll = () => {
    fetchData();
    fetchStats();
  };

  const canCreate = hasPermission("department.create");

  const renderContent = () => {
    if (isLoadingData) {
      return viewMode === "grid" ? (
        <DepartmentGridSkeleton />
      ) : (
        <DepartmentGridSkeleton />
      );
    }

    if (data.length === 0) {
      return (
        <Card className="shadow-sm border-dashed">
          <CardContent className="flex h-96 flex-col items-center justify-center text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="font-semibold text-lg">{t("empty.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {search ? t("empty.desc_search") : t("empty.desc_default")}
            </p>
            {search && (
                <Button
                variant="link"
                onClick={() => setSearch("")}
                className="mt-2 text-primary"
              >
                {t("toolbar.clear_filters")}
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    if (viewMode === "table") {
      return (
        <DepartmentTable
          data={data}
          onDelete={setDeleteId}
          onRefresh={refreshAll}
        />
      );
    }

    // Grid View (Sử dụng component tách biệt nếu có, hoặc inline như bạn gửi)
    return (
      <DepartmentGrid
        data={data}
        isLoading={isLoadingData}
        onDelete={setDeleteId}
        onSuccess={refreshAll}
      />
    );
  };

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
                {t("grid.units_display", { count: filteredTotalItems })}
              </span>
            </div>
            {canCreate && <DepartmentDialog onSuccess={refreshAll} />}
          </div>
        </div>

        {/* --- STATS --- */}
        {isLoadingStats ? (
          <DepartmentStatsSkeleton />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("stats.total_departments")}
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statsTotalItems}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("stats.active_units")}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- TOOLBAR --- */}
        {isLoadingData && data.length === 0 ? (
          <DepartmentsToolbarSkeleton />
        ) : (
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("toolbar.search_placeholder")}
                      className="pl-9"
                      value={search}
                      onChange={handleSearchChange}
                    />
                  </div>
                  {search && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearch("")}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* VIEW MODE TOGGLE */}
                <div className="flex bg-muted/30 rounded-lg border border-border/50 p-1 gap-1">
                  <Button
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* --- CONTENT --- */}
        <div className="min-h-[300px]">{renderContent()}</div>

        {/* --- PAGINATION --- */}
        {!isLoadingData && data.length > 0 && (
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTotalItems}
                onPageChange={setCurrentPage}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Xóa phòng ban?"
        description="Hành động này sẽ vô hiệu hóa phòng ban và không thể hoàn tác."
        onConfirm={handleDelete}
        confirmLabel="Xóa vĩnh viễn"
        variant="destructive"
      />
    </div>
  );
}
