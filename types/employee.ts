import { DepartmentInfo } from "./department";
import { SystemRole } from "./roles";
import { TeamInfo } from "./team";

export interface Employee {
  clientId: string;
  userId: string;
  firstName: string;
  lastName: string;
  systemRole: SystemRole;
  imageUrl: string;
  departments: DepartmentInfo[];
  teams: TeamInfo[];
}

export interface EmployeeListData {
  data: Employee[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
