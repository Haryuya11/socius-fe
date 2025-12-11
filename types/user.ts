import { DepartmentInfo } from "./department";
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
}