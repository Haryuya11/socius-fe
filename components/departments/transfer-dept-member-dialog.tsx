/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { departmentService } from "@/services/department-service";
import { DepartmentMember, Department } from "@/types/department";
import { DEPT_ROLES, ROLE_LABELS } from "@/types/roles";

import {
  transferMemberSchema,
  TransferMemberFormValues,
} from "@/lib/validations/department";
import { useTranslations } from "next-intl";

interface TransferProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  member: DepartmentMember;
  currentDeptCode: string;
  onSuccess: () => void;
}

export function TransferDeptMemberDialog({
  open,
  onOpenChange,
  member,
  currentDeptCode,
  onSuccess,
}: TransferProps) {
  const t = useTranslations("Departments");
  const [depts, setDepts] = useState<Department[]>([]);

  const form = useForm<TransferMemberFormValues>({
    resolver: zodResolver(transferMemberSchema),
    defaultValues: {
      toDepartmentCode: "",
      roleCode: DEPT_ROLES.MEMBER,
      isPrimary: false,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        toDepartmentCode: "",
        roleCode: DEPT_ROLES.MEMBER,
        isPrimary: false,
      });

      departmentService
        .fetchDepartments({ page: 1, size: 100 })
        .then((res) =>
          setDepts(
            res.data.filter((d) => d.departmentCode !== currentDeptCode),
          ),
        )
        .catch(console.error);
    }
  }, [open, currentDeptCode, form]);

  const onSubmit: SubmitHandler<TransferMemberFormValues> = async (values) => {
    try {
      await departmentService.transferMember({
        employeeId: member.employee.clientId,
        fromDepartmentCode: currentDeptCode,
        ...values,
      });
      toast.success(t("member.transfer_success") || "Transfer successful!");
      onOpenChange(false);
      onSuccess();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t("member.transfer_failed") || "Transfer failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("member.transfer_title")}</DialogTitle>
          <DialogDescription>
            {t("member.transfer_desc_prefix")} {" "}
            <strong>
              {member.employee.firstName} {member.employee.lastName}
            </strong>{" "}
            {t("member.transfer_desc_suffix")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="toDepartmentCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("member.to_department_label")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("member.select_placeholder") || "Select department..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {depts.map((d) => (
                        <SelectItem
                          key={d.departmentCode}
                          value={d.departmentCode}
                        >
                          {d.departmentName}{" "}
                          <span className="text-muted-foreground text-xs ml-1">
                            ({d.departmentCode})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <FormLabel>{t("member.new_role_label")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(DEPT_ROLES).map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <div className="flex flex-col justify-end pb-3 space-y-2">
                <Label>{t("member.status_label")}</Label>
                <div className="flex items-center gap-2 border p-2 rounded">
                  <FormField
                    control={form.control}
                    name="isPrimary"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <span className="text-sm">{t("member.primary_label")}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("dialog.cancel")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                )}
                {t("member.transfer_confirm")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
