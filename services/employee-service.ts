import http from "@/lib/axios";
import { Employee, EmployeeListData } from "@/types/employee";
import { ApiResponse, PaginatedResponse } from "@/types/response";

export interface SearchCondition {
  clientId?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
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
      firstName: "",
      lastName: "",
      systemRole: "",
    };

    const payload = {
      condition: condition,
      pageRequest: {
        pageNumber: page,
        pageSize: size,
      },
      sortRequests: [
        { sortBy: "first_name", sortDirection: "ASC" },
        { sortBy: "created_at", sortDirection: "DESC" },
      ],
    };

    try {
      const response = await http.post<
        ApiResponse<PaginatedResponse<Employee>>
      >("/mvc/employees/search", payload);
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
};
