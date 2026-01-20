import * as z from "zod";

export const departmentSchema = z.object({
  departmentCode: z
    .string()
    .min(1, "Mã phòng ban là bắt buộc")
    .regex(/^[A-Z0-9_]+$/, "Mã chỉ chứa chữ hoa, số và gạch dưới"),
  departmentName: z.string().min(1, "Tên phòng ban là bắt buộc"),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;

export const transferMemberSchema = z.object({
  toDepartmentCode: z.string().min(1, "Vui lòng chọn phòng ban đích"),
  roleCode: z.string().min(1, "Vui lòng chọn vai trò"),
  isPrimary: z.boolean(),
});

export type TransferMemberFormValues = z.infer<typeof transferMemberSchema>;

export const addMemberSchema = z.object({
  employeeId: z.string().min(1, "Vui lòng chọn nhân viên"),
  roleCode: z.string().min(1, "Vui lòng chọn vai trò"),
  isPrimary: z.boolean(),
});

export type AddMemberFormValues = z.infer<typeof addMemberSchema>;