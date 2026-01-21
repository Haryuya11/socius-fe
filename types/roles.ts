export const SYSTEM_ROLES = {
  ADMIN: "SYS_ADMIN",
  USER: "USER",
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

export const DEPT_ROLES = {
  DIRECTOR: "DEPT_DIR",
  MANAGER: "DEPT_MGR",
  MEMBER: "DEPT_MEM",
} as const;

export type DepartmentRole = (typeof DEPT_ROLES)[keyof typeof DEPT_ROLES];

export const TEAM_ROLES = {
  LEADER: "TEAM_LEAD",
  MEMBER: "TEAM_MEM",
} as const;

export type TeamRole = (typeof TEAM_ROLES)[keyof typeof TEAM_ROLES];

export type RoleCode = SystemRole | DepartmentRole | TeamRole;
export const ROLE_LABELS: Record<RoleCode, string> = {
  [SYSTEM_ROLES.ADMIN]: "System Administrator",
  [SYSTEM_ROLES.USER]: "User",
  [DEPT_ROLES.DIRECTOR]: "Director (Giám đốc)",
  [DEPT_ROLES.MANAGER]: "Manager (Quản lý)",
  [DEPT_ROLES.MEMBER]: "Member (Nhân viên)",
  [TEAM_ROLES.LEADER]: "Leader (Trưởng nhóm)",
  [TEAM_ROLES.MEMBER]: "Member (Thành viên)",
};

export const ROLE_COLORS: Record<
  RoleCode,
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "yellow"
  | "blue"
  | "green"
> = {
  [SYSTEM_ROLES.ADMIN]: "destructive",
  [SYSTEM_ROLES.USER]: "secondary",

  [DEPT_ROLES.DIRECTOR]: "yellow",
  [DEPT_ROLES.MANAGER]: "blue",
  [DEPT_ROLES.MEMBER]: "outline",

  [TEAM_ROLES.LEADER]: "blue",
  [TEAM_ROLES.MEMBER]: "outline",
};
