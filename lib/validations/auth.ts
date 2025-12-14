import * as z from "zod";

export const changePasswordSchema = (t: (key: string) => string) => {
  return z
    .object({
      currentPassword: z.string().min(1, t("current_password_required")),
      newPassword: z
        .string()
        .min(6, t("new_password_min"))
        .regex(/[A-Z]/, t("password_uppercase"))
        .regex(/[0-9]/, t("password_number"))
        .regex(/[^A-Za-z0-9]/, t("password_special")),
      confirmPassword: z.string().min(1, t("confirm_password_required")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("passwords_not_match"),
      path: ["confirmPassword"],
    });
};

export type ChangePasswordFormValues = z.infer<
  ReturnType<typeof changePasswordSchema>
>;
