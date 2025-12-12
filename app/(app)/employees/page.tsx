"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  Users,
  Network,
  Loader2,
  UserPlus,
} from "lucide-react";

import type { Employee } from "@/types/employee";
import { employeeService } from "@/services/employee-service";

// Imports Components đã tách
import { EmployeeTreeView } from "@/components/employees/employee-tree-view";
import { PaginationControl } from "@/components/ui/pagination-control";
import { EmployeeGrid } from "@/components/employees/employee-grid";
import { EmployeeTable } from "@/components/employees/employee-table";

export default function EmployeesPage() {
  const t = useTranslations("Employees");

  const [viewMode, setViewMode] = useState<"table" | "grid" | "tree">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await employeeService.fetchEmployees({
        page: currentPage,
        size: 10,
        keyword: searchTerm,
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
  }, [currentPage, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

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
              <span className="text-xs text-muted-foreground">
                {t("total_label")}
              </span>
            </div>
            <Button className="gap-2 shadow-sm">
              <UserPlus className="h-4 w-4" />
              {t("add_new")}
            </Button>
          </div>
        </div>

        {/* Toolbar Section */}
        <Card className="shadow-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("search_placeholder")}
                  className="pl-9 h-10 bg-background border-border/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 gap-2 border-border/50 hover:bg-muted/50 bg-transparent"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("filter")}</span>
                </Button>
                <div className="h-8 w-px bg-border/50" />
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
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t("loading")}</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <Card className="shadow-sm border-dashed">
            <CardContent className="flex h-96 flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted/50 p-4 mb-4">
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{t("empty.title")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm
                  ? t("empty.desc_search", { query: searchTerm })
                  : t("empty.desc_default")}
              </p>
              {!searchTerm && (
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  {t("add_new")}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === "table" && <EmployeeTable data={data} />}
            {viewMode === "grid" && <EmployeeGrid data={data} />}
            {viewMode === "tree" && <EmployeeTreeView data={data} />}
          </>
        )}

        {/* Pagination Section */}
        {!isLoading && data.length > 0 && (
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
