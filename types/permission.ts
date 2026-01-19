// Định nghĩa Scope theo đúng dữ liệu trả về (GLOBAL thay vì SYSTEM)
export const PERMISSION_SCOPE = {
  GLOBAL: "GLOBAL",
  DEPARTMENT: "DEPARTMENT",
  TEAM: "TEAM",
} as const;

export type PermissionScope =
  (typeof PERMISSION_SCOPE)[keyof typeof PERMISSION_SCOPE];

export type PermissionCode =
  | "system.full"
  | "self.profile.view"
  | "self.profile.update"
  | "self.password.update"
  | "self.avatar.upload"
  | "employee.view.basic"
  | "employee.view.salary"
  | "department.view"
  | "team.view"
  | "team.member.add"
  | "team.member.remove"
  | "team.member.role.update"
  | "role.view"
  | "task.view.self"
  | "task.update.self"
  | "task.view.team"
  | "task.view.department"
  | "task.create"
  | "task.update"
  | "task.delete"
  | "task.assign"
  | "task.approve"
  | string;

export interface Permission {
  scope: PermissionScope;
  resourceCode: string;
  permissionCode: PermissionCode;
}
