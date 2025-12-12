import { Employee, EmployeeListData } from "@/types/employee";
import { PaginatedResponse } from "@/types/response";

export interface EmployeeQueryParams {
  page?: number;
  size?: number;
  keyword?: string;
  sort?: string;
}

// 1. DATA GIẢ LẬP (MOCK DATA)
// Tôi nhân bản dữ liệu bạn cung cấp lên để test phân trang
const MOCK_DATA: Employee[] = [
  {
    clientId: "6309fa4c-994d-4ffe-bdd1-2e3459aaa964",
    userId: "22520198@gm.uit.edu.vn",
    firstName: "Anh",
    lastName: "Lanh",
    systemRole: "SYS_ADMIN",
    imageUrl: "",
    departments: [
      {
        departmentCode: "WIBU",
        departmentName: "Wibu Department",
        roleCode: "DEPT_MEM",
        roleName: "Department Member",
        isPrimary: true,
      },
    ],
    teams: [
      {
        teamCode: "TEAM008",
        teamName: "Wibu Vip VIP",
        roleCode: "TEAM_LEAD",
        roleName: "Team Leader",
        isLeader: true,
      },
      {
        teamCode: "TEAM002",
        teamName: "Wibu Vip Pro",
        roleCode: "TEAM_LEAD",
        roleName: "Team Leader",
        isLeader: true,
      },
    ],
  },
  {
    clientId: "4c8ef801-4b2f-4541-97ee-879777cf101b",
    userId: "nguyenbaduy011@gmail.com",
    firstName: "Duy",
    lastName: "Nguyen",
    systemRole: "SYS_ADMIN",
    imageUrl: "",
    departments: [
      {
        departmentCode: "WIBU",
        departmentName: "Wibu Department",
        roleCode: "DEPT_MEM",
        roleName: "Department Member",
        isPrimary: true,
      },
    ],
    teams: [
      {
        teamCode: "TEAM002",
        teamName: "Wibu Vip Pro",
        roleCode: "TEAM_MEM",
        roleName: "Team Member",
        isLeader: false,
      },
    ],
  },
  {
    clientId: "dcc0c4e0-9482-4975-a02f-15b5e55c4e4a",
    userId: "nguyenbaduy044@gmail.com",
    firstName: "Minh",
    lastName: "Tran",
    systemRole: "USER",
    imageUrl: "",
    departments: [
      {
        departmentCode: "IT",
        departmentName: "IT Support",
        roleCode: "DEPT_MEM",
        roleName: "Department Member",
        isPrimary: true,
      },
    ],
    teams: [],
  },
  {
    clientId: "9aa5a1e0-d9d7-4426-8662-98dd0d71d017",
    userId: "user_test_01@gmail.com",
    firstName: "Hoang",
    lastName: "Le",
    systemRole: "MANAGER",
    imageUrl: "",
    departments: [],
    teams: [
      {
        teamCode: "TEAM002",
        teamName: "Design Team",
        roleCode: "TEAM_MEM",
        roleName: "Team Member",
        isLeader: false,
      },
    ],
  },
  // Tạo thêm data giả bằng cách loop (để test pagination)
  ...Array.from({ length: 15 }).map((_, i) => ({
    clientId: `mock-id-${i}`,
    userId: `employee${i + 5}@company.com`,
    firstName: `Employee`,
    lastName: `Number ${i + 5}`,
    systemRole: i % 3 === 0 ? "SYS_ADMIN" : "USER",
    imageUrl: "",
    departments: [
      {
        departmentCode: "DEV",
        departmentName: "Development",
        roleCode: "DEPT_MEM",
        roleName: "Dev Member",
        isPrimary: true,
      },
    ],
    teams: [],
  })),
];

// 2. SERVICE GIẢ LẬP
export const employeeService = {
  fetchEmployees: async (
    params?: EmployeeQueryParams
  ): Promise<PaginatedResponse<Employee>> => {
    // Giả lập độ trễ mạng (Network Latency) để thấy loading spinner quay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const page = params?.page || 1;
    const size = params?.size || 10;
    const keyword = params?.keyword?.toLowerCase().trim() || "";

    // A. Logic Search giả lập (Client-side filtering)
    let filteredData = MOCK_DATA;
    if (keyword) {
      filteredData = MOCK_DATA.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(keyword) ||
          emp.lastName.toLowerCase().includes(keyword) ||
          emp.userId.toLowerCase().includes(keyword)
      );
    }

    // B. Logic Pagination giả lập
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / size);
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const itemsForPage = filteredData.slice(startIndex, endIndex);

    // C. Trả về đúng cấu trúc Backend
    return {
      data: itemsForPage,
      totalItems: totalItems,
      totalPages: totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const emp = MOCK_DATA.find((e) => e.clientId === id);
    if (!emp) throw new Error("Employee not found");
    return emp;
  },

  deleteEmployee: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`Mock deleted employee: ${id}`);
    return true;
  },
};
