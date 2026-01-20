export interface Department {
  departmentCode: string;
  departmentName: string;
  roleCode?: string; // Dùng khi hiển thị trong list của User
  isPrimary?: boolean; // Dùng khi hiển thị trong list của User
}

export interface DepartmentMember {
  roleCode: string; // DEPT_DIR, DEPT_MGR, DEPT_MEM
  isPrimary: boolean;
  department: Department;
  employee: {
    clientId: string;
    userId: string;
    firstName: string;
    lastName: string;
    systemRole: string;
    imageUrl: string;
    salary: number;
  };
}

export interface DepartmentInput {
  departmentCode: string;
  departmentName: string;
}
