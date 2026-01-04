"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl"; // Hook i18n
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  LayoutGrid,
  List,
  Network,
  Filter,
  Users,
  UserPlus,
  X,
} from "lucide-react";

import type { Employee } from "@/types/employee";
import {
  employeeService,
  type SearchCondition,
} from "@/services/employee-service";

import { EmployeeTreeView } from "@/components/employees/employee-tree-view";
import { PaginationControl } from "@/components/ui/pagination-control";
import { EmployeeGrid } from "@/components/employees/employee-grid";
import { EmployeeTable } from "@/components/employees/employee-table";

import { EmployeeGridSkeleton } from "@/components/skeleton/employees/employee-grid";
import { EmployeeTableSkeleton } from "@/components/skeleton/employees/employee-table";
import { EmployeeTreeSkeleton } from "@/components/skeleton/employees/employee-tree-skeleton";

import { useDebounce } from "@/hooks/use-debounce";
import { useMounted } from "@/hooks/use-mounted";
import { AddEmployeeDialog } from "@/components/profile/add-employee-dialog";

export default function EmployeesPage() {
  const t = useTranslations("Employees"); // Namespace: Employees

  const mounted = useMounted();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ... (Logic state giữ nguyên)
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
  const [tempCondition, setTempCondition] =
    useState<SearchCondition>(initialCondition);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [data, setData] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const debouncedCondition = useDebounce(searchCondition, 400);

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

  useEffect(() => {
    if (mounted) fetchEmployees();
  }, [fetchEmployees, mounted]);

  // ... (Event handlers giữ nguyên)
  const handleQuickSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newCond = { ...searchCondition, firstName: val };
    setSearchCondition(newCond);
    setTempCondition(newCond);
    setCurrentPage(1);
    updateUrl(newCond, 1);
  };

  const handleInputChange = (field: keyof SearchCondition, value: string) => {
    setTempCondition((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilter = () => {
    setSearchCondition(tempCondition);
    setCurrentPage(1);
    updateUrl(tempCondition, 1);
    setIsFilterOpen(false);
  };

  const resetFilter = () => {
    const emptyState = {
      userId: "",
      firstName: "",
      lastName: "",
      systemRole: "",
    };
    setTempCondition(emptyState);
    setSearchCondition(emptyState);
    setCurrentPage(1);
    updateUrl(emptyState, 1);
    setIsFilterOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(searchCondition, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFiltersCount =
    Object.values(searchCondition).filter(Boolean).length;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 p-6 space-y-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/50">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          {/* Toolbar Skeleton */}
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                  <Skeleton className="h-10 w-full sm:w-64" />
                  <Skeleton className="h-10 w-24" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Content Skeleton */}
          <EmployeeTableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 p-6 space-y-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Section */}
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
            <AddEmployeeDialog onSuccess={fetchEmployees}>
              <Button className="gap-2 shadow-sm">
                <UserPlus className="h-4 w-4" />
                {t("add_new")}
              </Button>
            </AddEmployeeDialog>
          </div>
        </div>

        {/* Toolbar Section */}
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                {/* Quick Search */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("search_placeholder")} // i18n
                    className="pl-9 h-10 bg-background border-border/50"
                    value={searchCondition.firstName}
                    onChange={handleQuickSearch}
                  />
                </div>

                {/* Filter Popover */}
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={activeFiltersCount > 0 ? "secondary" : "outline"}
                      size="sm"
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
                            onClick={resetFilter}
                          >
                            {t("actions.reset")}
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-3">
                        <div className="grid gap-1.5">
                          <Label htmlFor="userId" className="text-xs">
                            {t("filters.user_id_label")}
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
                          <Label htmlFor="lastName" className="text-xs">
                            {t("filters.last_name_label")}
                          </Label>
                          <Input
                            id="lastName"
                            className="h-8"
                            value={tempCondition.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="firstName" className="text-xs">
                            {t("filters.first_name_label")}
                          </Label>
                          <Input
                            id="firstName"
                            className="h-8"
                            value={tempCondition.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="role" className="text-xs">
                            {t("filters.role_label")}
                          </Label>
                          <Select
                            value={tempCondition.systemRole}
                            onValueChange={(val) =>
                              handleInputChange(
                                "systemRole",
                                val === "ALL" ? "" : val
                              )
                            }
                          >
                            <SelectTrigger id="role" className="h-8">
                              <SelectValue
                                placeholder={t("filters.select_role")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">
                                {t("filters.all_roles")}
                              </SelectItem>
                              <SelectItem value="SYS_ADMIN">
                                System Admin
                              </SelectItem>
                              <SelectItem value="USER">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button className="w-full h-8" onClick={applyFilter}>
                        {t("actions.apply")}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Reset Button (Outside) */}
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilter}
                    className="h-10 px-2 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-muted/30 rounded-lg border border-border/50 p-1 gap-1">
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-background"
                  onClick={() => setViewMode("table")}
                  title={t("views.table")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-background"
                  onClick={() => setViewMode("grid")}
                  title={t("views.grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "tree" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-background"
                  onClick={() => setViewMode("tree")}
                  title={t("views.tree")}
                >
                  <Network className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        {isLoading ? (
          <>
            {viewMode === "table" && <EmployeeTableSkeleton />}
            {viewMode === "grid" && <EmployeeGridSkeleton />}
            {viewMode === "tree" && <EmployeeTreeSkeleton />}
          </>
        ) : data.length === 0 ? (
          <Card className="shadow-sm border-dashed">
            <CardContent className="flex h-96 flex-col items-center justify-center text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg">{t("empty.title")}</h3>
              <p className="text-sm text-muted-foreground">
                {activeFiltersCount > 0
                  ? t("empty.desc_filtered")
                  : t("empty.desc_default")}{" "}
              </p>
              {activeFiltersCount > 0 && (
                <Button
                  variant="link"
                  onClick={resetFilter}
                  className="mt-2 text-primary"
                >
                  {t("actions.clear_filters")}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === "table" && <EmployeeTable data={data} />}
            {viewMode === "grid" && <EmployeeGrid data={data} />}
            {viewMode === "tree" && (
              <div className="w-full overflow-x-auto pb-4">
                <div className="min-w-[800px] sm:min-w-full">
                  <EmployeeTreeView data={data} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
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
