import { EmployeeDetail } from "./employee";

export interface Team {
  teamCode: string;
  teamName: string;
  departmentCode: string;
}

export interface TeamInfo {
  teamCode: string;
  teamName: string;
  roleCode: string; 
  isLeader: boolean;
}

export interface TeamMember {
  roleCode: string;
  isLeader: boolean;
  team: Team;
  employee: EmployeeDetail;
}

export interface TeamInput {
  teamCode: string;
  teamName: string;
  departmentCode: string;
}
