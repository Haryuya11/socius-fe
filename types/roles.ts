// types/roles.ts
export const SYSTEM_ROLES = ["SYS_ADMIN", "USER"] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

// Nếu cần object mapping
export const ROLE_LABELS: Record<SystemRole, string> = {
  SYS_ADMIN: "SYS_ADMIN",
  USER: "USER",
} as const;
