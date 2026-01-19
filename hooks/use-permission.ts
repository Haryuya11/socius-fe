import { useAuth } from "./use-auth";

export type PermissionCode =
  | "system.full"
  | "task.create"
  | "task.update"
  | "task.delete"
  | "task.view.self"
  | "task.view.team"
  | "task.view.department"
  | "task.approve"
  | "task.assign";

export const usePermission = () => {
  const { user } = useAuth();

  // Check quyền có tồn tại không (ưu tiên Global Admin)
  const hasPermission = (
    permission: PermissionCode,
    scope?: "TEAM" | "DEPARTMENT",
    resourceCode?: string,
  ): boolean => {
    if (!user || !user.permissions) return false;

    // 1. Global Admin
    const isGlobalAdmin = user.permissions.some(
      (p) => p.scope === "GLOBAL" && p.permissionCode === "system.full",
    );
    if (isGlobalAdmin) return true;

    // 2. Check quyền chung (bất kể resource)
    if (!scope || !resourceCode) {
      return user.permissions.some((p) => p.permissionCode === permission);
    }

    // 3. Check quyền chính xác trên Resource
    return user.permissions.some(
      (p) =>
        p.permissionCode === permission &&
        p.scope === scope &&
        p.resourceCode === resourceCode,
    );
  };

  // Lấy danh sách Team mà user có quyền cụ thể
  const getTeamsWithPermission = (permission: PermissionCode): string[] => {
    if (!user || !user.permissions) return [];

    // Nếu Admin -> trả về tất cả team user đang tham gia
    const isGlobalAdmin = user.permissions.some(
      (p) => p.scope === "GLOBAL" && p.permissionCode === "system.full",
    );
    if (isGlobalAdmin) return user.teams.map((t) => t.teamCode);

    return user.permissions
      .filter((p) => p.scope === "TEAM" && p.permissionCode === permission)
      .map((p) => p.resourceCode);
  };

  return { hasPermission, getTeamsWithPermission };
};
