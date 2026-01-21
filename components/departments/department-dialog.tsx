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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("Departments");
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
        toast.success(t("dialog.edit_title") || "Department updated successfully");
      } else {
        await departmentService.createDepartment(values);
        toast.success(t("create") || "Department created successfully");
      }
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("dialog.save") || "An error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> {t("create")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("dialog.edit_title") : t("dialog.create_title")}
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
                  <FormLabel>{t("dialog.department_code")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isEdit}
                      placeholder={t("dialog.department_code")}
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
                  <FormLabel>{t("dialog.department_name")}</FormLabel>
                    <FormControl>
                    <Input {...field} placeholder={t("dialog.department_name")} />
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
                {t("dialog.cancel")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                )}
                {isEdit ? t("dialog.save") : t("create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
