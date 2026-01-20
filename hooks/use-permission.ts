/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "./use-auth";

export type PermissionScope = "GLOBAL" | "DEPARTMENT" | "TEAM";

export type PermissionCode =
  // --- SYSTEM ---
  | "system.full"

  // --- SELF ---
  | "self.profile.view"
  | "self.profile.update"
  | "self.password.update"
  | "self.avatar.upload"

  // --- EMPLOYEE ---
  | "employee.view.basic"
  | "employee.view.salary"
  | "employee.salary.update"
  | "employee.profile.update"

  // --- DEPARTMENT ---
  | "department.view"
  | "department.create"
  | "department.update"
  | "department.delete"
  | "department.member.add"
  | "department.member.remove"
  | "department.member.role.update"

  // --- TEAM ---
  | "team.view"
  | "team.create"
  | "team.update"
  | "team.delete"
  | "team.member.add"
  | "team.member.remove"
  | "team.member.role.update"

  // --- TASK ---
  | "task.view.self"
  | "task.update.self"
  | "task.view.department"
  | "task.view.team"
  | "task.create"
  | "task.update"
  | "task.delete"
  | "task.assign"
  | "task.approve"

  // --- REPORT ---
  | "report.view"
  | "report.export"

  // Fallback string for dynamic cases
  | string;

export const usePermission = () => {
  const { user } = useAuth();

  /**
   * Kiểm tra user có quyền thực hiện hành động cụ thể không.
   * @param permission Mã quyền (VD: department.update)
   * @param scope Phạm vi (GLOBAL, DEPARTMENT, TEAM)
   * @param resourceCode Mã tài nguyên (VD: WIBU, TEAM001)
   */
  const hasPermission = (
    permission: PermissionCode,
    scope?: PermissionScope,
    resourceCode?: string,
  ): boolean => {
    if (!user || !user.permissions) return false;

    // 1. Global Admin (Quyền tối thượng)
    const isGlobalAdmin = user.permissions.some(
      (p) => p.scope === "GLOBAL" && p.permissionCode === "system.full",
    );
    if (isGlobalAdmin) return true;

    // 2. Check quyền chung (Khi không cần check resource cụ thể)
    // VD: Check xem user có quyền "department.create" không (thường là quyền Global hoặc chung)
    if (!scope || !resourceCode) {
      return user.permissions.some((p) => p.permissionCode === permission);
    }

    // 3. Check quyền chính xác trên Resource
    // VD: Check quyền "department.update" trên scope "DEPARTMENT" với code "WIBU"
    return user.permissions.some(
      (p) =>
        p.permissionCode === permission &&
        p.scope === scope &&
        p.resourceCode === resourceCode,
    );
  };

  /**
   * Lấy danh sách mã Team mà user có quyền cụ thể.
   * Dùng để filter danh sách hoặc hiển thị dropdown.
   */
  const getTeamsWithPermission = (permission: PermissionCode): string[] => {
    if (!user || !user.permissions) return [];

    // Nếu Admin -> trả về tất cả team user đang tham gia
    // (Lưu ý: Logic này giả định admin có quyền trên mọi team họ tham gia,
    // thực tế Admin có thể access all team, tùy vào logic backend trả về user.teams)
    const isGlobalAdmin = user.permissions.some(
      (p) => p.scope === "GLOBAL" && p.permissionCode === "system.full",
    );

    if (isGlobalAdmin) {
      return user.teams?.map((t: any) => t.teamCode) || [];
    }

    // Lọc các resourceCode có quyền tương ứng
    return user.permissions
      .filter((p) => p.scope === "TEAM" && p.permissionCode === permission)
      .map((p) => p.resourceCode);
  };

  /**
   * Lấy danh sách mã Department mà user có quyền cụ thể.
   */
  const getDepartmentsWithPermission = (
    permission: PermissionCode,
  ): string[] => {
    if (!user || !user.permissions) return [];

    const isGlobalAdmin = user.permissions.some(
      (p) => p.scope === "GLOBAL" && p.permissionCode === "system.full",
    );

    if (isGlobalAdmin) {
      return user.departments?.map((d: any) => d.departmentCode) || [];
    }

    return user.permissions
      .filter(
        (p) => p.scope === "DEPARTMENT" && p.permissionCode === permission,
      )
      .map((p) => p.resourceCode);
  };

  return {
    hasPermission,
    getTeamsWithPermission,
    getDepartmentsWithPermission,
  };
};
