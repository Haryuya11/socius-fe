import { SYSTEM_ROLES } from "@/types/roles";
import * as z from "zod";

// Base schema
export const employeeSchema = z.object({
  userId: z.email({ message: "Email không hợp lệ" }),
  firstName: z.string().min(1, "Họ là bắt buộc"),
  lastName: z.string().min(1, "Tên là bắt buộc"),
  systemRole: z.enum(SYSTEM_ROLES, {
    message: "Vui lòng chọn vai trò",
  }),
  salary: z.number().min(0, "Lương không được âm"),
  imageUrl: z.string().optional(),
});

export const createEmployeeSchema = (t?: (key: string) => string) => {
  return employeeSchema;
};

export const updateEmployeeSchema = employeeSchema;

export type EmployeeInput = z.infer<typeof employeeSchema>;

export interface UpdateEmployeeBody extends EmployeeInput {
  clientId: string;
}