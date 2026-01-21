/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { usePermission } from "@/hooks/use-permission"; 

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { EmployeeSelector } from "@/components/common/employee-selector";
import { departmentService } from "@/services/department-service";
import { DEPT_ROLES, ROLE_LABELS } from "@/types/roles";
import {
  AddMemberFormValues,
  addMemberSchema,
} from "@/lib/validations/department";

export function AddDeptMemberDialog({
  deptCode,
  onSuccess,
}: {
  deptCode: string;
  onSuccess: () => void;
}) {
  const t = useTranslations("Departments");
  const [open, setOpen] = useState(false);
  const { hasPermission } = usePermission();

  const canAddMember = hasPermission(
    "department.member.add",
    "DEPARTMENT",
    deptCode,
  );

  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      employeeId: "",
      roleCode: DEPT_ROLES.MEMBER,
      isPrimary: false,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        employeeId: "",
        roleCode: DEPT_ROLES.MEMBER,
        isPrimary: false,
      });
    }
  }, [open, form]);

  const onSubmit = async (values: AddMemberFormValues) => {
    try {
      const payload = [
        {
          employeeId: values.employeeId,
          roleCode: values.roleCode,
          isPrimary: values.isPrimary,
        },
      ];
      await departmentService.addMembers(deptCode, payload);
      toast.success(t("member.add_success") || "Member added successfully");
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          t("member.add_failed") ||
          "Failed to add member",
      );
    }
  };

  if (!canAddMember) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <UserPlus className="h-4 w-4" /> {t("member.add_button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{t("member.add_title", { code: deptCode })}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("member.select_label") || "Select employee"}
                  </FormLabel>
                  <FormControl>
                    <EmployeeSelector
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={
                        t("member.select_placeholder") ||
                        "Search by name or email..."
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="roleCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("member.role_label") || "Role"}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent side="bottom">
                        {Object.values(DEPT_ROLES).map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col justify-end pb-2">
                <FormField
                  control={form.control}
                  name="isPrimary"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 space-y-0">
                      <FormLabel className="cursor-pointer text-sm font-normal">
                        {t("member.primary_label") || "Primary department?"}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {t("dialog.cancel") || "Cancel"}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("member.add_button")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
