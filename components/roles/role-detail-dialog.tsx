"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock,
  Copy,
  Search,
  X,
  ShieldCheck,
  Briefcase,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Role } from "@/types/permission";
import {
  groupPermissionsByResource,
  getActionConfig,
} from "@/utils/permission-utils";

interface RoleDetailDialogProps {
  role: Role | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_ICON_MAP: Record<string, React.ElementType> = {
  SYSTEM: ShieldCheck,
  DEPARTMENT: Briefcase,
  DEFAULT: Users,
};

export function RoleDetailDialog({
  role,
  open,
  onOpenChange,
}: RoleDetailDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!open && searchQuery) setSearchQuery("");

  const filteredPermissions = useMemo(() => {
    if (!role) return [];
    if (!searchQuery) return role.permissions;

    const lowerQuery = searchQuery.toLowerCase();
    return role.permissions.filter(
      (p) =>
        p.permissionName.toLowerCase().includes(lowerQuery) ||
        p.permissionCode.toLowerCase().includes(lowerQuery) ||
        (p.resource && p.resource.toLowerCase().includes(lowerQuery)),
    );
  }, [role, searchQuery]);

  const groupedPermissions = useMemo(
    () => groupPermissionsByResource(filteredPermissions),
    [filteredPermissions],
  );

  if (!role) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(JSON.stringify(role.permissions, null, 2));
    toast.success("Đã copy JSON quyền hạn vào clipboard");
  };

  const RoleIcon = ROLE_ICON_MAP[role.roleType] ?? ROLE_ICON_MAP.DEFAULT;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[90vw] lg:max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-sm shadow-2xl border-none">
        {/* ===== HEADER ===== */}
        <DialogHeader className="p-6 pb-4 border-b bg-muted/20 shrink-0">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            {/* Left */}
            <div className="flex items-start gap-4">
              <div
                className={`hidden sm:flex p-3 rounded-2xl border shadow-inner ${
                  role.roleType === "SYSTEM"
                    ? "bg-red-100/50 text-red-600 border-red-200"
                    : role.roleType === "DEPARTMENT"
                      ? "bg-amber-100/50 text-amber-600 border-amber-200"
                      : "bg-blue-100/50 text-blue-600 border-blue-200"
                }`}
              >
                <RoleIcon className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <DialogTitle className="text-2xl font-bold tracking-tight">
                    {role.roleName}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className="font-mono text-xs uppercase tracking-wider bg-background/50"
                  >
                    {role.roleCode}
                  </Badge>
                </div>
                <DialogDescription className="text-base line-clamp-2 max-w-3xl">
                  {role.description}
                </DialogDescription>
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm quyền hạn..."
                  className="pl-9 bg-background h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="px-1.5 rounded-sm">
                  {filteredPermissions.length}
                </Badge>
                kết quả
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ===== BODY ===== */}
        <div className="flex-1 overflow-y-auto bg-muted/5 p-6">
          {Object.keys(groupedPermissions).length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <Search className="h-12 w-12 mb-2" />
              <p>Không tìm thấy quyền nào phù hợp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(groupedPermissions).map(([resource, perms]) => (
                <div
                  key={resource}
                  className="flex flex-col bg-card rounded-xl border shadow-sm overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-primary/70" />
                      <span className="font-bold text-sm uppercase tracking-wider">
                        {resource}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                      {perms.length}
                    </Badge>
                  </div>

                  {/* Permissions */}
                  <div className="divide-y divide-border/30">
                    {perms.map((p) => {
                      const actionConfig = getActionConfig(p.action);
                      const ActionIcon = actionConfig.icon;

                      return (
                        <div
                          key={p.permissionCode}
                          className="group p-3 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`shrink-0 mt-0.5 h-7 w-7 rounded-md flex items-center justify-center border ${actionConfig.color}`}
                            >
                              <ActionIcon className="h-3.5 w-3.5" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate block">
                                {p.permissionName}
                              </span>

                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {p.description || "Quyền hạn hệ thống."}
                              </p>

                              <code className="mt-2 inline-block text-[10px] font-mono bg-muted/50 px-1.5 py-0.5 rounded border">
                                {p.permissionCode}
                              </code>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <DialogFooter className="p-4 border-t bg-background shrink-0 flex items-center justify-between">
          <div className="text-xs text-muted-foreground hidden sm:block">
            ID: <span className="font-mono">{role.roleCode}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCopyCode}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy JSON
            </Button>
            <Button onClick={() => onOpenChange(false)}>Đóng</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
