/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  X,
  LayoutGrid,
  List,
  Network,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PaginationControl } from "@/components/ui/pagination-control";

// Types & Services
import { Team } from "@/types/teams";
import { teamService } from "@/services/team-service";
import { useDebounce } from "@/hooks/use-debounce";
import { useMounted } from "@/hooks/use-mounted";
import { usePermission } from "@/hooks/use-permission"; 

// Components
import { TeamStats } from "@/components/teams/team-stats";
import { TeamDialog } from "@/components/teams/team-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

// Views
import { TeamGrid } from "@/components/teams/team-grid";
import { TeamTable } from "@/components/teams/team-table";
import { TeamTreeView } from "@/components/teams/team-tree-view";

// Skeletons
import { TeamTableSkeleton } from "@/components/skeleton/teams/team-table-skeleton";
import { TeamGridSkeleton } from "@/components/skeleton/teams/team-grid-skeleton";
import { TeamTreeSkeleton } from "@/components/skeleton/teams/team-tree-skeleton";
import { TeamStatsSkeleton } from "@/components/skeleton/teams/team-stats-skeleton";
import { TeamsToolbarSkeleton } from "@/components/skeleton/teams/teams-toolbar-skeleton";

interface TeamSearchCondition {
  teamName: string;
  teamCode: string;
  departmentCode: string;
}

export default function TeamsPage() {
  const mounted = useMounted();
  const { hasPermission } = usePermission();

  const [viewMode, setViewMode] = useState<"grid" | "table" | "tree">("grid");

  const [searchCondition, setSearchCondition] = useState<TeamSearchCondition>({
    teamName: "",
    teamCode: "",
    departmentCode: "",
  });
  const [tempCondition, setTempCondition] =
    useState<TeamSearchCondition>(searchCondition);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [data, setData] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filteredTotalItems, setFilteredTotalItems] = useState(0);
  const [statsTotalItems, setStatsTotalItems] = useState(0);
  const [statsUniqueDepts, setStatsUniqueDepts] = useState(0);

  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canCreate = hasPermission("team.create");

  const debouncedCondition = useDebounce(searchCondition, 200);

  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      const pageSize =
        viewMode === "tree" ? 100 : viewMode === "grid" ? 12 : 10;

      const conditionPayload = {
        teamName: debouncedCondition.teamName || undefined,
        teamCode: debouncedCondition.teamCode || undefined,
        departmentCode: debouncedCondition.departmentCode || undefined,
      };

      const res = await teamService.fetchTeams({
        page: currentPage,
        size: pageSize,
        condition: conditionPayload,
      });

      setData(res.data);
      setFilteredTotalItems(res.totalItems);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách team");
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  }, [currentPage, debouncedCondition, viewMode]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await teamService.fetchTeams({
        page: 1,
        size: 1000,
        condition: {},
      });

      setStatsTotalItems(res.totalItems);
      const uniqueDepts = new Set(res.data.map((t) => t.departmentCode)).size;
      setStatsUniqueDepts(uniqueDepts);
    } catch (error) {
      console.error("Failed to fetch team stats", error);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchTeams();
      fetchStats();
    }
  }, [fetchTeams, fetchStats, mounted]);

  const executeDelete = async () => {
    if (!teamToDelete) return;
    setIsDeleting(true);
    try {
      await teamService.deleteTeam(teamToDelete);
      toast.success("Xóa team thành công");
      setTeamToDelete(null);
      fetchTeams();
      fetchStats();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xóa thất bại");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchCondition((prev) => ({ ...prev, teamName: val }));
    setTempCondition((prev) => ({ ...prev, teamName: val }));
    setCurrentPage(1);
  };

  const activeFiltersCount =
    (searchCondition.teamCode ? 1 : 0) +
    (searchCondition.departmentCode ? 1 : 0);

  const resetFilter = () => {
    const empty = { teamName: "", teamCode: "", departmentCode: "" };
    setTempCondition(empty);
    setSearchCondition(empty);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const renderContent = () => {
    if (isLoading) {
      if (viewMode === "table") return <TeamTableSkeleton />;
      if (viewMode === "tree") return <TeamTreeSkeleton />;
      return <TeamGridSkeleton />;
    }

    if (data.length === 0) {
      return (
        <Card className="shadow-sm border-dashed">
          <CardContent className="flex h-96 flex-col items-center justify-center text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg">Không tìm thấy Team</h3>
            <p className="text-sm text-muted-foreground">
              {activeFiltersCount > 0
                ? "Thử thay đổi bộ lọc."
                : "Chưa có nhóm nào trong hệ thống."}
            </p>
            {activeFiltersCount > 0 && (
              <Button
                variant="link"
                onClick={resetFilter}
                className="mt-2 text-primary"
              >
                Xóa bộ lọc
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    switch (viewMode) {
      case "table":
        return (
          <TeamTable
            data={data}
            onDelete={setTeamToDelete}
            onSuccess={fetchTeams}
          />
        );
      case "tree":
        return <TeamTreeView data={data} />;
      case "grid":
      default:
        return (
          <TeamGrid
            data={data}
            onDelete={setTeamToDelete}
            onSuccess={fetchTeams}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 p-6 space-y-6 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/50">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
                  Quản lý Team
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Tổ chức và quản lý các nhóm làm việc hiệu quả
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border/50">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{filteredTotalItems}</span>
            </div>

            {canCreate && (
              <TeamDialog
                onSuccess={() => {
                  fetchTeams();
                  fetchStats();
                }}
              >
                <Button className="gap-2 shadow-sm">
                  <Users className="h-4 w-4" /> Thêm Team
                </Button>
              </TeamDialog>
            )}
          </div>
        </div>

        {isFirstLoad ? (
          <TeamStatsSkeleton />
        ) : (
          <TeamStats
            totalItems={statsTotalItems}
            uniqueDepts={statsUniqueDepts}
          />
        )}

        {/* TOOLBAR */}
        {isFirstLoad ? (
          <TeamsToolbarSkeleton />
        ) : (
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                  {/* Search Input */}
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên team..."
                      className="pl-9"
                      value={searchCondition.teamName}
                      onChange={handleQuickSearch}
                    />
                  </div>

                  {/* Advanced Filter */}
                  <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={
                          activeFiltersCount > 0 ? "secondary" : "outline"
                        }
                        className="gap-2 border-dashed"
                      >
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Lọc</span>
                        {activeFiltersCount > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                            {activeFiltersCount}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="start">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium leading-none">Bộ lọc</h4>
                          {activeFiltersCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                              onClick={resetFilter}
                            >
                              Xóa tất cả
                            </Button>
                          )}
                        </div>
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="teamCode">Mã Team</Label>
                            <Input
                              id="teamCode"
                              placeholder="TEAM..."
                              value={tempCondition.teamCode}
                              onChange={(e) =>
                                setTempCondition((p) => ({
                                  ...p,
                                  teamCode: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="deptCode">Mã Phòng Ban</Label>
                            <Input
                              id="deptCode"
                              placeholder="DEPT..."
                              value={tempCondition.departmentCode}
                              onChange={(e) =>
                                setTempCondition((p) => ({
                                  ...p,
                                  departmentCode: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => {
                            setSearchCondition(tempCondition);
                            setCurrentPage(1);
                            setIsFilterOpen(false);
                          }}
                        >
                          Áp dụng
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={resetFilter}
                      className="text-muted-foreground hover:text-destructive"
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
                  <Button
                    variant={viewMode === "tree" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode("tree")}
                  >
                    <Network className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CONTENT RENDER */}
        <div className="min-h-[400px]">{renderContent()}</div>

        {!isLoading && data.length > 0 && viewMode !== "tree" && (
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

      {/* CONFIRM DIALOG */}
      <ConfirmDialog
        open={!!teamToDelete}
        onOpenChange={(open) => !open && setTeamToDelete(null)}
        title="Xóa nhóm làm việc?"
        description={
          <span>
            Bạn có chắc chắn muốn xóa team <strong>{teamToDelete}</strong>?
            <br />
            Hành động này không thể hoàn tác.
          </span>
        }
        confirmLabel="Xóa vĩnh viễn"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={executeDelete}
      />
    </div>
  );
}
