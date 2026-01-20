/* eslint-disable @typescript-eslint/no-explicit-any */
import http from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types/response";
import {
  Department,
  DepartmentInput,
  DepartmentMember,
} from "@/types/department";

export const departmentService = {
  // 10. Search & List (Đã update return type)
  fetchDepartments: async (params?: {
    page?: number;
    size?: number;
    condition?: { departmentCode?: string; departmentName?: string };
  }) => {
    const payload = {
      condition: params?.condition || {},
      pageRequest: {
        pageNumber: params?.page || 1,
        pageSize: params?.size || 12, // Grid 3-4 cột thì để 12 là đẹp
      },
      sortRequests: [],
    };

    // API trả về: { ..., data: { data: [], totalItems: 11, ... } }
    const res = await http.post<ApiResponse<PaginatedResponse<Department>>>(
      "/api/departments/search",
      payload,
    );

    // Trả về nguyên cục data phân trang
    return res.data.data;
  },

  // ... Các hàm khác giữ nguyên (getDepartmentByCode, create, update...)
  getDepartmentByCode: async (code: string) => {
    const res = await http.get<ApiResponse<Department>>(
      `/api/departments/${code}`,
    );
    return res.data.data;
  },
  createDepartment: async (data: DepartmentInput) => {
    const res = await http.post<ApiResponse<null>>("/api/departments", data);
    return res.data;
  },
  updateDepartment: async (code: string, data: Partial<DepartmentInput>) => {
    const res = await http.put<ApiResponse<null>>(
      `/api/departments/${code}`,
      data,
    );
    return res.data;
  },
  deleteDepartment: async (code: string) => {
    const res = await http.delete<ApiResponse<null>>(
      `/api/departments/${code}`,
    );
    return res.data;
  },
  getMembers: async (code: string) => {
    const res = await http.get<ApiResponse<DepartmentMember[]>>(
      `/api/departments/${code}/employees`,
    );
    return res.data.data;
  },
  addMembers: async (deptCode: string, employees: any[]) => {
    const res = await http.post(`/api/departments/${deptCode}/employees`, {
      employees,
    });
    return res.data;
  },
  removeMembers: async (deptCode: string, employeeIds: string[]) => {
    const res = await http.delete(`/api/departments/${deptCode}/employees`, {
      data: { employeeIds },
    });
    return res.data;
  },
  transferMember: async (payload: any) => {
    const res = await http.post("/api/departments/transfer", payload);
    return res.data;
  },
  updateMemberRole: async (
    deptCode: string,
    empId: string,
    newRoleCode: string,
  ) => {
    const res = await http.put(
      `/api/departments/${deptCode}/employees/${empId}/role/${newRoleCode}`,
    );
    return res.data;
  },
};
