import * as z from "zod";

export const teamSchema = z.object({
  teamCode: z
    .string()
    .min(1, "Mã team không được để trống")
    .max(50, "Mã team quá dài")
    .regex(/^[a-zA-Z0-9_]+$/, "Mã chỉ chứa chữ, số và gạch dưới"),
  teamName: z.string().min(1, "Tên team không được để trống"),
  departmentCode: z.string().min(1, "Phải chọn phòng ban trực thuộc"),
});

export type TeamFormValues = z.infer<typeof teamSchema>;
