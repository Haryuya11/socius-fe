import { DepartmentInfo } from "./department";
import { ScopePermission } from "./permission";
import { SystemRole } from "./roles";
import { TeamInfo } from "./team";

export interface UserProfile {
  clientId: string;
  userId: string;
  firstName: string;
  lastName: string;
  systemRole: SystemRole;
  salary: number;
  imageUrl: string;
  departments: DepartmentInfo[];
  teams: TeamInfo[];
  permissions: ScopePermission[];
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