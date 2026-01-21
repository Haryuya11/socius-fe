import http from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types/response";
import { Team, TeamInput, TeamMember } from "@/types/teams";

export interface TeamQueryParams {
  page?: number;
  size?: number;
  condition?: {
    teamCode?: string;
    teamName?: string;
    departmentCode?: string;
  };
  sort?: string;
}

export const teamService = {
  fetchTeams: async (
    params?: TeamQueryParams,
  ): Promise<PaginatedResponse<Team>> => {
    const page = params?.page || 1;
    const size = params?.size || 10;

    const condition = params?.condition || {
      teamCode: null,
      teamName: null,
      departmentCode: null,
      ...(params?.condition || {}),
    };

    const payload = {
      condition,
      pageRequest: { pageNumber: page, pageSize: size },
      sortRequests: [{ sortBy: "teamName", sortDirection: "ASC" }],
    };

    const response = await http.post<ApiResponse<PaginatedResponse<Team>>>(
      "/api/teams/search",
      payload,
    );
    return response.data.data;
  },

  getTeamByCode: async (code: string): Promise<Team> => {
    const response = await http.get<ApiResponse<Team>>(`/api/teams/${code}`);
    return response.data.data;
  },

  createTeam: async (data: TeamInput): Promise<boolean> => {
    const response = await http.post<ApiResponse<null>>("/api/teams", data);
    return response.data.success;
  },

  updateTeam: async (code: string, data: Partial<TeamInput>): Promise<Team> => {
    const response = await http.put<ApiResponse<Team>>(
      `/api/teams/${code}`,
      data,
    );
    return response.data.data;
  },

  deleteTeam: async (code: string): Promise<boolean> => {
    const response = await http.delete<ApiResponse<null>>(`/api/teams/${code}`);
    return response.data.success;
  },

  // --- MEMBERS MANAGEMENT ---

  getTeamMembers: async (teamCode: string): Promise<TeamMember[]> => {
    const response = await http.get<ApiResponse<TeamMember[]>>(
      `/api/teams/${teamCode}/employees`,
    );
    return response.data.data;
  },

  addMembers: async (
    teamCode: string,
    employees: { employeeId: string; roleCode?: string; isLeader?: boolean }[],
  ) => {
    // Mặc định roleCode là TEAM_MEM nếu không truyền
    const payload = {
      employees: employees.map((e) => ({
        roleCode: "TEAM_MEM",
        isLeader: false,
        ...e,
      })),
    };
    const response = await http.post(
      `/api/teams/${teamCode}/employees`,
      payload,
    );
    return response.data;
  },

  removeMembers: async (teamCode: string, employeeIds: string[]) => {
    const payload = {
      employees: employeeIds.map((id) => ({ employeeId: id })),
    };
    // Axios delete with body needs a specific config structure
    const response = await http.delete(`/api/teams/${teamCode}/employees`, {
      data: payload,
    });
    return response.data;
  },

  changeLeader: async (teamCode: string, newLeadClientId: string) => {
    const response = await http.put(
      `/api/teams/${teamCode}/lead?newLeadClientId=${newLeadClientId}`,
    );
    return response.data;
  },

  transferMember: async (payload: {
    employeeId: string;
    fromTeamCode: string;
    toTeamCode: string;
    roleCode?: string;
    isLeader?: boolean;
  }) => {
    const response = await http.post("/api/teams/transfer", {
      roleCode: "TEAM_MEM",
      isLeader: false,
      ...payload,
    });
    return response.data;
  },
};
