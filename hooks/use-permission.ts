/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "./use-auth";

export type PermissionScope = "GLOBAL" | "DEPARTMENT" | "TEAM";
export type PermissionCode = string; // Để string cho linh hoạt

export const usePermission = () => {
  const { user } = useAuth();

  /**
   * Kiểm tra quyền.
   * Logic:
   * 1. User là SYS_ADMIN -> True
   * 2. User có permission "system.full" scope GLOBAL -> True
   * 3. User có permission trùng code VÀ trùng resourceCode -> True
   */
  const hasPermission = (
    permission: PermissionCode,
    scope?: PermissionScope,
    resourceCode?: string,
  ): boolean => {
    if (!user || !Array.isArray(user.permissions)) return false;

    // 1. Check System Role
    if (user.systemRole === "SYS_ADMIN") return true;

    // 2. Check quyền System Full (Global)
    const hasGlobalFull = user.permissions.some(
      (p) => p.permissionCode === "system.full" && p.scope === "GLOBAL",
    );
    if (hasGlobalFull) return true;

    // 3. Check quyền cụ thể
    return user.permissions.some((p) => {
      // Quyền phải khớp mã
      if (p.permissionCode !== permission) return false;

      // Nếu người gọi hàm không truyền resourceCode (check quyền chung)
      // -> Chỉ cần user có quyền đó ở bất cứ đâu là được (hoặc tùy logic business của bạn)
      // Ở đây ta ưu tiên strict: Nếu không truyền resourceCode, ta coi như check quyền Global/System
      if (!resourceCode) return true;

      // Nếu có truyền resourceCode, bắt buộc phải khớp scope và code
      return p.scope === scope && p.resourceCode === resourceCode;
    });
  };

  /**
   * Lấy danh sách ID các Team/Dept mà user có quyền này
   */
  const getTeamsWithPermission = (permission: PermissionCode): string[] => {
    if (!user || !user.permissions) return [];

    // Admin hoặc Global Full -> Trả về tất cả team user đang tham gia
    const isSuperUser =
      user.systemRole === "SYS_ADMIN" ||
      user.permissions.some(
        (p) => p.permissionCode === "system.full" && p.scope === "GLOBAL",
      );

    if (isSuperUser) {
      return user.teams?.map((t: any) => t.teamCode) || [];
    }

    // Lọc trong danh sách permissions
    return user.permissions
      .filter(
        (p) =>
          p.scope === "TEAM" &&
          p.permissionCode === permission &&
          p.resourceCode,
      )
      .map((p) => p.resourceCode);
  };

  const getDepartmentsWithPermission = (
    permission: PermissionCode,
  ): string[] => {
    if (!user || !user.permissions) return [];

    const isSuperUser =
      user.systemRole === "SYS_ADMIN" ||
      user.permissions.some(
        (p) => p.permissionCode === "system.full" && p.scope === "GLOBAL",
      );

    if (isSuperUser) {
      return user.departments?.map((d: any) => d.departmentCode) || [];
    }

    return user.permissions
      .filter(
        (p) =>
          p.scope === "DEPARTMENT" &&
          p.permissionCode === permission &&
          p.resourceCode,
      )
      .map((p) => p.resourceCode);
  };

  return {
    hasPermission,
    getTeamsWithPermission,
    getDepartmentsWithPermission,
  };
};
