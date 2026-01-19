import http from "@/lib/axios";
import { EmployeeInput, UpdateEmployeeBody } from "@/lib/validations/employee";
import {
  AvatarUploadResponse,
  CreateEmployeeResponse,
  Employee,
  EmployeeDetail,
} from "@/types/employee";
import { ApiResponse, PaginatedResponse } from "@/types/response";

export interface SearchCondition {
  clientId?: string;
  userId?: string;
  fullName?: string;
  departmentCode?: string;
  teamCode?: string;
  systemRole?: string;
}

export interface EmployeeQueryParams {
  page?: number;
  size?: number;
  condition?: SearchCondition;
  sort?: string;
}

export const employeeService = {
  fetchEmployees: async (
    params?: EmployeeQueryParams
  ): Promise<PaginatedResponse<Employee>> => {
    const page = params?.page || 1;
    const size = params?.size || 10;

    const condition = params?.condition || {
      userId: "",
      fullName: "",
      departmentCode: "",
      teamCode: "",
      systemRole: "",
    };

    const payload = {
      condition: condition,
      pageRequest: {
        pageNumber: page,
        pageSize: size,
      },
      sortRequests: [{ sortBy: "fullName", sortDirection: "ASC" }],
    };

    try {
      const response = await http.post<
        ApiResponse<PaginatedResponse<Employee>>
      >("/api/employees/search", payload);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch employees", error);
      return {
        data: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        hasNext: false,
        hasPrevious: false,
      };
    }
  },

  // getEmployeeById: async (id: string): Promise<Employee> => {
  //   await new Promise((resolve) => setTimeout(resolve, 500));
  //   const emp = MOCK_DATA.find((e) => e.clientId === id);
  //   if (!emp) throw new Error("Employee not found");
  //   return emp;
  // },

  deleteEmployee: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`Mock deleted employee: ${id}`);
    return true;
  },

  createEmployee: async (
    data: EmployeeInput & { imageUrl?: string }
  ): Promise<boolean> => {
    const payload = {
      clientId: "",
      userId: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      systemRole: data.systemRole,
      salary: data.salary,
      imageUrl: data.imageUrl || "",
    };

    try {
      const response = await http.post<ApiResponse<CreateEmployeeResponse>>(
        "/api/employees",
        payload
      );
      return response.data.success;
    } catch (error) {
      console.error("Create employee failed", error);
      throw error;
    }
  },

  uploadAvatar: async (file: File): Promise<AvatarUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await http.post<ApiResponse<AvatarUploadResponse>>(
      "/api/employees/upload-avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.data;
  },

  updateEmployee: async (
    clientId: string,
    data: UpdateEmployeeBody
  ): Promise<boolean> => {
    try {
      const response = await http.put<ApiResponse<null>>(
        `/api/employees/${clientId}`,
        data
      );
      return response.data.success;
    } catch (error) {
      console.error("Update employee failed", error);
      throw error;
    }
  },

  getEmployeeById: async (id: string): Promise<EmployeeDetail> => {
    try {
      const response = await http.get<ApiResponse<EmployeeDetail>>(
        `/api/employees/${id}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch employee with id ${id}`, error);
      throw error;
    }
  },
};
