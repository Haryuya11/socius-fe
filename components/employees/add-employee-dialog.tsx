/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Save } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  createEmployeeSchema,
  EmployeeInput,
} from "@/lib/validations/employee";
import { employeeService } from "@/services/employee-service";
import { AvatarPicker } from "../profile/avatar-picker";
// [FIX] Import RoleCode để fix lỗi type indexing
import { ROLE_LABELS, SYSTEM_ROLES, RoleCode } from "@/types/roles";

interface AddEmployeeDialogProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function AddEmployeeDialog({
  children,
  onSuccess,
}: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  // Setup form
  const form = useForm<EmployeeInput>({
    resolver: zodResolver(createEmployeeSchema()),
    defaultValues: {
      userId: "",
      firstName: "",
      lastName: "",
      systemRole: "USER",
      salary: undefined,
      imageUrl: "",
    },
  });

  const onSubmit = async (data: EmployeeInput) => {
    try {
      let avatarPath = "";

      // BƯỚC 1: Nếu có chọn ảnh, Upload ảnh trước
      if (imageBlob) {
        const file = new File([imageBlob], "avatar.png", { type: "image/png" });
        const uploadRes = await employeeService.uploadAvatar(file);
        avatarPath = uploadRes.path;
      }

      // BƯỚC 2: Chuẩn bị data cuối cùng
      const payload = {
        ...data,
        imageUrl: avatarPath,
      };

      // BƯỚC 3: Gọi API tạo nhân viên
      await employeeService.createEmployee(payload);

      toast.success("Thêm nhân viên thành công!");

      setOpen(false);
      form.reset();
      setImageBlob(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || "Thêm thất bại";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm nhân viên
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Thêm nhân viên mới</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            {/* --- PHẦN CHỌN ẢNH --- */}
            <div className="flex justify-center mb-6">
              <AvatarPicker onImageCropped={(blob) => setImageBlob(blob)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ (First Name)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên (Last Name)</FormLabel>
                    <FormControl>
                      <Input placeholder="Văn A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email (UserID) */}
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Role */}
              <FormField
                control={form.control}
                name="systemRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai trò</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(SYSTEM_ROLES).map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role as RoleCode]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Salary */}
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lương cơ bản</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10000000"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
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
                <Save className="mr-2 h-4 w-4" />
                Lưu nhân viên
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
