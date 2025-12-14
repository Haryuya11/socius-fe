export const PERMISSION_SCOPE = {
  DEPARTMENT: "DEPARTMENT",
  TEAM: "TEAM",
  SYSTEM: "SYSTEM",
};

export type PermissionScope =
  (typeof PERMISSION_SCOPE)[keyof typeof PERMISSION_SCOPE];

export interface ScopePermission {
  scope: PermissionScope;
  scopeCode: string | null; 
  roleName: string;
  permissions: PermissionDetail[]; 
}

export interface PermissionDetail {
  permissionCode: string;
  permissionName: string;
  resource: string;
  action: string;
  description: string;
}
