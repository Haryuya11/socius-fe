import { Role } from "@/types/permission";
import { UserProfile } from "@/types/user";

/**
 * Kiểm tra xem User có quyền thực hiện hành động hay không
 * @param user - Thông tin user (lấy từ Profile)
 * @param roles - Danh sách định nghĩa Role (lấy từ API /api/roles)
 * @param permissionCode - Mã quyền cần check (VD: 'task.delete')
 * @param scopeCode - (Optional) Mã phòng ban hoặc mã Team nếu cần check quyền cục bộ
 */
export const checkPermission = (
  user: UserProfile | null,
  roles: Role[],
  permissionCode: string,
  scopeCode?: string,
): boolean => {
  if (!user || roles.length === 0) return false;

  // 1. Check quyền SYSTEM (Role cao nhất của user)
  // Lấy định nghĩa role của user trong list roles
  const systemRoleDef = roles.find((r) => r.roleCode === user.systemRole);

  // Nếu là SYS_ADMIN hoặc role này có quyền đó -> True
  if (user.systemRole === "SYS_ADMIN") return true;
  if (
    systemRoleDef?.permissions.some((p) => p.permissionCode === permissionCode)
  ) {
    return true;
  }

  // Nếu không có scopeCode (chỉ check quyền hệ thống), thì dừng ở đây
  if (!scopeCode) return false;

  // 2. Check quyền DEPARTMENT (Nếu scopeCode khớp với mã phòng ban)
  const dept = user.departments.find((d) => d.departmentCode === scopeCode);
  if (dept) {
    const deptRoleDef = roles.find((r) => r.roleCode === dept.roleCode);
    if (
      deptRoleDef?.permissions.some((p) => p.permissionCode === permissionCode)
    ) {
      return true;
    }
  }

  // 3. Check quyền TEAM (Nếu scopeCode khớp với mã team)
  const team = user.teams.find((t) => t.teamCode === scopeCode);
  if (team) {
    const teamRoleDef = roles.find((r) => r.roleCode === team.roleCode);
    if (
      teamRoleDef?.permissions.some((p) => p.permissionCode === permissionCode)
    ) {
      return true;
    }
  }

  return false;
};
