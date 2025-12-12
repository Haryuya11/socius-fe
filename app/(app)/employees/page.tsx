"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  Filter,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
  Network,
  Loader2,
} from "lucide-react";
import { getFullName, getInitials } from "@/utils/name-utils";
import { Employee } from "@/types/employee";
import { employeeService } from "@/services/employee-service";
import { EmployeeTreeView } from "@/components/employee-tree-view.tsx";

// Logic Avatar (Copy để dùng cho Table/Grid)
const PLACEHOLDER_AVATARS = [
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
];

const getAvatarUrl = (user: Employee) => {
  if (user.imageUrl) return user.imageUrl;
  const sum = user.userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = sum % PLACEHOLDER_AVATARS.length;
  return PLACEHOLDER_AVATARS[index];
};

export default function EmployeesPage() {
  const [viewMode, setViewMode] = useState<"table" | "grid" | "tree">("table");
  const [searchTerm, setSearchTerm] = useState("");

  // Data State
  const [data, setData] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Hàm gọi API
const fetchEmployees = useCallback(async () => {
  try {
    setIsLoading(true);

    console.log("Fetching with:", { page: currentPage, keyword: searchTerm });

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
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s workforce ({totalItems} total).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>Add Employee</Button>
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/40 p-4 rounded-lg border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8 bg-background"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Filter</span>
          </Button>
          <div className="h-8 w-[1px] bg-border mx-1" />
          <div className="flex bg-background rounded-md border p-0.5">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "tree" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("tree")}
              title="Tree View"
            >
              <Network className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3. CONTENT AREA */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-muted-foreground border rounded-md border-dashed">
          <Users className="h-8 w-8 mb-2 opacity-50" />
          <p>No employees found.</p>
        </div>
      ) : (
        <>
          {viewMode === "table" && <EmployeeTable data={data} />}
          {viewMode === "grid" && <EmployeeGrid data={data} />}
          {viewMode === "tree" && <EmployeeTreeView data={data} />}
        </>
      )}

      {/* 4. PAGINATION */}
      <div className="flex items-center justify-between px-2 pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS (Giữ nguyên trong file này hoặc tách ra nếu muốn) ---

function EmployeeTable({ data }: { data: Employee[] }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Employee</TableHead>
            <TableHead>System Role</TableHead>
            <TableHead>Departments</TableHead>
            <TableHead>Teams</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((emp) => {
            const fullName = getFullName(emp.firstName, emp.lastName);
            const avatarUrl = getAvatarUrl(emp);
            const initials = getInitials(emp.firstName, emp.lastName);

            return (
              <TableRow key={emp.clientId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{fullName}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {emp.userId}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      emp.systemRole === "SYS_ADMIN"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {emp.systemRole}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {emp.departments?.length > 0 ? (
                      emp.departments.map((dept) => (
                        <Badge
                          key={dept.departmentCode}
                          variant="outline"
                          className="font-normal bg-background"
                        >
                          <Building2 className="mr-1 h-3 w-3 opacity-50" />
                          {dept.departmentName}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-[250px]">
                    {emp.teams?.length > 0 ? (
                      emp.teams.map((team) => (
                        <Badge
                          key={team.teamCode}
                          variant="outline"
                          className="font-normal bg-background"
                        >
                          <Users className="mr-1 h-3 w-3 opacity-50" />
                          {team.teamName} {team.isLeader && "👑"}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit details</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function EmployeeGrid({ data }: { data: Employee[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((emp) => {
        const fullName = getFullName(emp.firstName, emp.lastName);
        const avatarUrl = getAvatarUrl(emp);
        const initials = getInitials(emp.firstName, emp.lastName);

        return (
          <Card
            key={emp.clientId}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <Avatar className="h-12 w-12 border border-border">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <CardTitle className="text-base truncate" title={fullName}>
                  {fullName}
                </CardTitle>
                <CardDescription className="truncate" title={emp.userId}>
                  {emp.userId}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Role:</span>
                  <Badge variant="secondary" className="text-xs">
                    {emp.systemRole}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase">
                    Primary Dept
                  </span>
                  <div className="flex items-center gap-2 text-sm truncate">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {emp.departments?.find((d) => d.isPrimary)
                      ?.departmentName || "N/A"}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-medium uppercase">
                    Teams
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {emp.teams?.slice(0, 3).map((t) => (
                      <Badge
                        key={t.teamCode}
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-5"
                      >
                        {t.teamName}
                      </Badge>
                    ))}
                    {emp.teams?.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{emp.teams.length - 3} more
                      </span>
                    )}
                    {(!emp.teams || emp.teams.length === 0) && (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
