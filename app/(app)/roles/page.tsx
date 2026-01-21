"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  LayoutGrid,
  Users,
  Building2,
  Search,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { roleService } from "@/services/role-service";
import { Role } from "@/types/permission";
import { RoleDetailDialog } from "@/components/roles/role-detail-dialog";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleService.fetchAllRoles();
        setRoles(data);
      } catch (error) {
        console.error("Failed to fetch roles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const filteredRoles = roles.filter(
    (r) =>
      r.roleName.toLowerCase().includes(search.toLowerCase()) ||
      r.roleCode.toLowerCase().includes(search.toLowerCase()),
  );

  const systemRoles = filteredRoles.filter((r) => r.roleType === "SYSTEM");
  const deptRoles = filteredRoles.filter((r) => r.roleType === "DEPARTMENT");
  const teamRoles = filteredRoles.filter((r) => r.roleType === "TEAM");

  // Helper render Card để code gọn hơn
  const renderRoleList = (
    data: Role[],
    emptyMsg: string,
    accentColor: string,
  ) => {
    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl">
          <Shield className="h-10 w-10 text-muted-foreground/30 mb-2" />
          <p className="text-muted-foreground">{emptyMsg}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
        {data.map((role) => (
          <Card
            key={role.roleCode}
            className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 border-border/60 cursor-pointer flex flex-col"
            onClick={() => setSelectedRole(role)}
          >
            {/* Top accent border */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 w-full ${accentColor}`}
            />

            <CardHeader className="pb-3 pt-6">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                    {role.roleName}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs opacity-80">
                    {role.roleCode}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 bg-background shadow-xs"
                >
                  {role.permissions.length} quyền
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 pb-4">
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed h-10 mb-4">
                {role.description || "Chưa có mô tả cho vai trò này."}
              </p>

              {/* Mini Permissions Preview */}
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.slice(0, 3).map((p, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-[10px] px-1.5 font-normal bg-muted/50 text-muted-foreground border-transparent"
                  >
                    {p.resource?.toUpperCase() || "MISC"}
                  </Badge>
                ))}
                {role.permissions.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 font-normal"
                  >
                    +{role.permissions.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>

            <CardFooter className="pt-0 pb-4">
              <div className="w-full text-xs font-medium text-muted-foreground group-hover:text-primary flex items-center justify-end gap-1 transition-colors">
                Xem chi tiết <span className="text-lg leading-3">›</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) return <RolesSkeleton />;

  return (
    <div className="p-6 md:p-8 min-h-screen bg-muted/10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            Phân quyền (Roles)
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-base">
            Quản lý danh sách vai trò và quyền hạn chi tiết trong hệ thống. Kiểm
            tra kỹ trước khi phân quyền cho nhân sự.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm Role, Code..."
            className="pl-9 bg-background shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="SYSTEM" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px] h-11 p-1 bg-muted/50 border">
          <TabsTrigger
            value="SYSTEM"
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="font-semibold">Hệ thống</span>
            <Badge
              variant="secondary"
              className="ml-1 px-1 py-0 h-4 text-[9px] min-w-4 justify-center"
            >
              {systemRoles.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="DEPARTMENT"
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
          >
            <Building2 className="h-4 w-4" />
            <span className="font-semibold">Phòng ban</span>
            <Badge
              variant="secondary"
              className="ml-1 px-1 py-0 h-4 text-[9px] min-w-4 justify-center"
            >
              {deptRoles.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="TEAM"
            className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
          >
            <Users className="h-4 w-4" />
            <span className="font-semibold">Đội nhóm</span>
            <Badge
              variant="secondary"
              className="ml-1 px-1 py-0 h-4 text-[9px] min-w-4 justify-center"
            >
              {teamRoles.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Content System */}
        <TabsContent value="SYSTEM" className="outline-none">
          {renderRoleList(
            systemRoles,
            "Không tìm thấy Role hệ thống nào.",
            "bg-red-500",
          )}
        </TabsContent>

        {/* Content Dept */}
        <TabsContent value="DEPARTMENT" className="outline-none">
          {renderRoleList(
            deptRoles,
            "Không tìm thấy Role phòng ban nào.",
            "bg-amber-500",
          )}
        </TabsContent>

        {/* Content Team */}
        <TabsContent value="TEAM" className="outline-none">
          {renderRoleList(
            teamRoles,
            "Không tìm thấy Role đội nhóm nào.",
            "bg-blue-500",
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Detail */}
      <RoleDetailDialog
        role={selectedRole}
        open={!!selectedRole}
        onOpenChange={(open) => !open && setSelectedRole(null)}
      />
    </div>
  );
}

function RolesSkeleton() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-5 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-72 rounded-lg" />
      </div>
      <Skeleton className="h-12 w-[500px] rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
