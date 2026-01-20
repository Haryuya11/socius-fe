/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { departmentService } from "@/services/department-service";
import { Department } from "@/types/department";

import {
  departmentSchema,
  DepartmentFormValues,
} from "@/lib/validations/department";

interface DepartmentDialogProps {
  initialData?: Department | null;
  onSuccess: () => void;
  children?: React.ReactNode;
}

export function DepartmentDialog({
  initialData,
  onSuccess,
  children,
}: DepartmentDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!initialData;

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      departmentCode: "",
      departmentName: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        departmentCode: initialData?.departmentCode || "",
        departmentName: initialData?.departmentName || "",
      });
    }
  }, [open, initialData, form]);

  const onSubmit = async (values: DepartmentFormValues) => {
    try {
      if (isEdit) {
        await departmentService.updateDepartment(initialData.departmentCode, {
          departmentName: values.departmentName,
        });
        toast.success("Cập nhật phòng ban thành công");
      } else {
        await departmentService.createDepartment(values);
        toast.success("Tạo phòng ban thành công");
      }
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Tạo Phòng Ban
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật Phòng Ban" : "Tạo Phòng Ban Mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <FormField
              control={form.control}
              name="departmentCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã Phòng Ban (Code)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isEdit}
                      placeholder="Vd: HR, DEV_Team..."
                      className="font-mono uppercase"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departmentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Phòng Ban</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Vd: Human Resources..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                )}
                {isEdit ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
