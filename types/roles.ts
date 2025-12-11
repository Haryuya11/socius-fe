export const SYSTEM_ROLES = {
  SYS_ADMIN: "SYS_ADMIN",
  USER: "USER",
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];
