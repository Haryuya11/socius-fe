export const PERMISSION_SCOPE = {
  GLOBAL: "GLOBAL",
  DEPARTMENT: "DEPARTMENT",
  TEAM: "TEAM",
} as const;

export type PermissionScope =
  (typeof PERMISSION_SCOPE)[keyof typeof PERMISSION_SCOPE];

export type PermissionCode =
  // SYSTEM
  | "system.full"
  | "role.view"

  // SELF (Cá nhân)
  | "self.profile.view"
  | "self.profile.update"
  | "self.password.update"
  | "self.avatar.upload"

  // EMPLOYEE (Nhân sự)
  | "employee.view.basic"
  | "employee.view.salary"
  | "employee.profile.update"

  // DEPARTMENT (Phòng ban)
  | "department.view"
  | "department.member.add"
  | "department.member.remove"
  | "department.member.role.update"

  // TEAM (Nhóm)
  | "team.view"
  | "team.create"
  | "team.update"
  | "team.delete"
  | "team.member.add"
  | "team.member.remove"
  | "team.member.role.update"

  // TASK (Công việc)
  | "task.create"
  | "task.update"
  | "task.update.self"
  | "task.delete"
  | "task.view.self"
  | "task.view.team"
  | "task.view.department"
  | "task.assign"
  | "task.approve"

  // CONVERSATION (Hội thoại)
  | "conversation.view"
  | "conversation.create"
  | "conversation.update"
  | "conversation.delete"
  | "conversation.participant.manage"
  | "conversation.file.manage"

  // MESSAGE (Tin nhắn)
  | "message.view"
  | "message.send"
  | "message.update"
  | "message.delete"
  | "message.reaction"

  // Fallback
  | string;

export interface Permission {
  permissionCode: PermissionCode;
  permissionName: string;
  resource: string;
  action: string;
  description: string;
}

export interface Role {
  roleCode: string;
  roleName: string;
  roleType: "SYSTEM" | "DEPARTMENT" | "TEAM";
  description: string;
  permissions: Permission[];
}
