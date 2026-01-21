import { Department } from "./department";
import { Permission } from "./permission";
import { SystemRole } from "./roles";
import { TeamInfo } from "./teams";

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
  permissions: Permission[];
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
