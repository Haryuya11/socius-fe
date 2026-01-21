import { Department } from "./department";
import { SystemRole } from "./roles";
import { TeamInfo } from "./teams";

export interface UserPermissionGrant {
  scope: "GLOBAL" | "DEPARTMENT" | "TEAM";
  resourceCode: string; 
  permissionCode: string; 
}

export interface UserProfile {
  clientId: string;
  userId: string;
  firstName: string;
  lastName: string;
  systemRole: SystemRole;
  salary: number;
  imageUrl: string;
  departments: Department[];
  teams: TeamInfo[];
  permissions: UserPermissionGrant[];
}

export interface BasicUserInfo {
  userId: string;
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
