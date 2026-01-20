/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Search,
  Trash2,
  Pencil,
  MoreHorizontal,
  LayoutGrid,
  List, // Import icon List
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { usePermission } from "@/hooks/use-permission";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PaginationControl } from "@/components/ui/pagination-control";

// Skeletons
import { DepartmentGridSkeleton } from "@/components/skeleton/departments/department-grid-skeleton";
import { DepartmentsToolbarSkeleton } from "@/components/skeleton/departments/departments-toolbar-skeleton";
import { DepartmentStatsSkeleton } from "@/components/skeleton/departments/department-stats-skeleton";

// Components
import { DepartmentDialog } from "@/components/departments/department-dialog";
import { DepartmentTable } from "@/components/departments/department-table"; // Import Table mới
import { departmentService } from "@/services/department-service";
import { Department } from "@/types/department";

export default function DepartmentsPage() {
  const router = useRouter();
  const { hasPermission } = usePermission();

  const [data, setData] = useState<Department[]>([]);
  // [NEW] State viewMode
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await departmentService.fetchDepartments({
        page: currentPage,
        size: viewMode === "grid" ? 12 : 20, // List view hiển thị được nhiều hơn
        condition: { departmentName: debouncedSearch },
      });
      setData(res.data);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, viewMode]); // Reset page khi đổi view mode

  useEffect(() => {
    fetchData();
  }, [currentPage, debouncedSearch, viewMode]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await departmentService.deleteDepartment(deleteId);
      toast.success("Đã xóa phòng ban");
      if (data.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchData();
      }
    } catch (error: any) {
      toast.error("Không thể xóa phòng ban này");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const canCreate = hasPermission("department.create");

  // Hàm render nội dung chính để code đỡ rối
  const renderContent = () => {
    if (loading)
      return viewMode === "grid" ? (
        <DepartmentGridSkeleton />
      ) : (
        <div className="space-y-4">
          <DepartmentStatsSkeleton />
          <DepartmentGridSkeleton />
        </div>
      ); // Skeleton cho table tạm dùng grid hoặc làm riêng

    if (data.length === 0) {
      return (
        <Card className="shadow-sm border-dashed">
          <CardContent className="flex h-96 flex-col items-center justify-center text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg">Không tìm thấy dữ liệu</h3>
            <p className="text-sm text-muted-foreground">
              Thử thay đổi bộ lọc hoặc tạo phòng ban mới.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (viewMode === "table") {
      return (
        <DepartmentTable
          data={data}
          onDelete={setDeleteId}
          onRefresh={fetchData}
        />
      );
    }

    // Default Grid View
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map((dept) => {
          const canEdit = hasPermission(
            "department.update",
            "DEPARTMENT",
            dept.departmentCode,
          );
          const canDelete = hasPermission(
            "department.delete",
            "DEPARTMENT",
            dept.departmentCode,
          );

          return (
            <Card
              key={dept.departmentCode}
              className="group hover:shadow-lg transition-all duration-300 border-border/60 flex flex-col"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 mb-2">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/departments/${dept.departmentCode}`)
                        }
                      >
                        Xem chi tiết
                      </DropdownMenuItem>
                      {canEdit && (
                        <DepartmentDialog
                          initialData={dept}
                          onSuccess={fetchData}
                        >
                          <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full">
                            <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                          </div>
                        </DepartmentDialog>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(dept.departmentCode)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle
                  className="text-lg font-bold line-clamp-1"
                  title={dept.departmentName}
                >
                  {dept.departmentName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 flex-1">
                <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                  <span className="text-muted-foreground mr-2 text-xs uppercase font-bold">
                    Code:
                  </span>
                  <span className="font-mono text-xs font-medium text-foreground">
                    {dept.departmentCode}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  variant="outline"
                  className="w-full hover:bg-purple-600 hover:text-white group-hover:border-purple-500/50 transition-colors"
                  onClick={() =>
                    router.push(`/departments/${dept.departmentCode}`)
                  }
                >
                  Quản lý nhân sự
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
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
                  Quản lý Phòng Ban
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Cấu trúc tổ chức và phân quyền nhân sự
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border/50">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{totalItems} Đơn vị</span>
            </div>
            {canCreate && <DepartmentDialog onSuccess={fetchData} />}
          </div>
        </div>

        {/* --- STATS --- */}
        {loading ? (
          <DepartmentStatsSkeleton />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tổng số Phòng ban
                </CardTitle>
                <Building2 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* --- TOOLBAR --- */}
        {loading ? (
          <DepartmentsToolbarSkeleton />
        ) : (
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên phòng ban..."
                      className="pl-9"
                      value={search}
                      onChange={handleSearchChange}
                    />
                  </div>
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

        {/* --- CONTENT (GRID or TABLE) --- */}
        <div className="min-h-[300px]">{renderContent()}</div>

        {/* --- PAGINATION --- */}
        {data.length > 0 && (
          <Card className="shadow-sm border-border/50">
            <CardContent className="p-4">
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
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
