/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {  Loader2 } from "lucide-react";
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

// [FIX] 1. Import constants từ roles.ts
import { DEPT_ROLES, ROLE_LABELS } from "@/types/roles";

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
  const [depts, setDepts] = useState<Department[]>([]);

  // [FIX] Set default value dùng constant cho an toàn
  const form = useForm({
    defaultValues: {
      toDepartmentCode: "",
      roleCode: DEPT_ROLES.MEMBER, // Thay vì hardcode string "DEPT_MEM"
      isPrimary: false,
    },
  });

  useEffect(() => {
    if (open) {
      departmentService
        .fetchDepartments({ page: 1, size: 100 })
        .then((res) =>
          setDepts(
            res.data.filter((d) => d.departmentCode !== currentDeptCode),
          ),
        )
        .catch(console.error);
    }
  }, [open, currentDeptCode]);

  const onSubmit = async (values: any) => {
    try {
      await departmentService.transferMember({
        employeeId: member.employee.clientId,
        fromDepartmentCode: currentDeptCode,
        ...values,
      });
      toast.success("Điều chuyển thành công!");
      onOpenChange(false);
      onSuccess();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Lỗi điều chuyển");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Điều chuyển nhân sự</DialogTitle>
          <DialogDescription>
            Chuyển{" "}
            <strong>
              {member.employee.firstName} {member.employee.lastName}
            </strong>{" "}
            sang phòng ban khác.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="toDepartmentCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phòng ban đích</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng ban..." />
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
                    <FormLabel>Vai trò mới</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {/* [FIX] 2. Map qua DEPT_ROLES để hiển thị option động */}
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
                <Label>Trạng thái</Label>
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
                  <span className="text-sm">Là phòng chính</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                )}
                Xác nhận
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
