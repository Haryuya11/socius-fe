import * as z from "zod";

export const createTaskSchema = z
  .object({
    title: z.string().min(1, "Tiêu đề không được để trống").max(200),
    description: z.string().optional(),
    receiverId: z.string().min(1, "Người nhận không được để trống"),
    teamCode: z.string().min(1, "Team không được để trống"),
    departmentCode: z.string().min(1, "Phòng ban không được để trống"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    deliveryType: z.number().default(1),
    // [FIX] Bỏ required_error gây lỗi, chỉ cần z.date() là đủ
    startDate: z.date({
      message: "Vui lòng chọn ngày bắt đầu",
    }),
    dueDate: z.date({
      message: "Vui lòng chọn hạn hoàn thành",
    }),
  })
  .refine((data) => data.dueDate >= data.startDate, {
    message: "Hạn hoàn thành phải sau hoặc bằng ngày bắt đầu",
    path: ["dueDate"],
  });

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  receiverId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
});

export const subTaskSchema = z
  .object({
    title: z.string().min(1, "Tiêu đề không được để trống").max(200),
    description: z.string().optional(),
    receiverId: z.string().min(1, "Người nhận không được để trống"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    // [FIX] Bỏ config object gây lỗi TS
    startDate: z.date({
      message: "Vui lòng chọn ngày bắt đầu",
    }),
    dueDate: z.date({
      message: "Vui lòng chọn hạn hoàn thành",
    }),
  })
  .refine((data) => data.dueDate >= data.startDate, {
    message: "Hạn hoàn thành phải sau ngày bắt đầu",
    path: ["dueDate"],
  });

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;
export type SubTaskFormValues = z.infer<typeof subTaskSchema>;
