/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

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

// Schema Validation

export function AddDeptMemberDialog({
  deptCode,
  onSuccess,
}: {
  deptCode: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);

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
      toast.success("Thêm thành viên thành công");
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Thêm thành viên thất bại");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <UserPlus className="h-4 w-4" /> Thêm thành viên
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Thêm nhân sự vào {deptCode}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            {/* Chọn Nhân viên */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chọn nhân viên</FormLabel>
                  <FormControl>
                    <EmployeeSelector
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tìm theo tên hoặc email..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Chọn Vai trò */}
              <FormField
                control={form.control}
                name="roleCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai trò</FormLabel>
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

              {/* Chọn Phòng chính */}
              <div className="flex flex-col justify-end pb-2">
                <FormField
                  control={form.control}
                  name="isPrimary"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 space-y-0">
                      <FormLabel className="cursor-pointer text-sm font-normal">
                        Phòng chính?
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
                Hủy
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Thêm nhân sự
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
