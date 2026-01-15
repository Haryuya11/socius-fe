/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Save } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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

import { teamService } from "@/services/team-service";
import { Team } from "@/types/teams";
import { teamSchema, TeamFormValues } from "@/lib/validations/team";

interface TeamDialogProps {
  children?: React.ReactNode;
  initialData?: Team | null;
  onSuccess?: () => void;
}

export function TeamDialog({
  children,
  initialData,
  onSuccess,
}: TeamDialogProps) {
  const [open, setOpen] = useState(false);
  const isEdit = !!initialData;

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      teamCode: "",
      teamName: "",
      departmentCode: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        teamCode: initialData?.teamCode || "",
        teamName: initialData?.teamName || "",
        departmentCode: initialData?.departmentCode || "",
      });
    }
  }, [open, initialData, form]);

  const onSubmit = async (data: TeamFormValues) => {
    try {
      if (isEdit) {
        await teamService.updateTeam(initialData.teamCode, data);
        toast.success("Cập nhật team thành công!");
      } else {
        await teamService.createTeam(data);
        toast.success("Tạo team mới thành công!");
      }

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button className="gap-2 shadow-sm">
            {isEdit ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isEdit ? "Cập nhật" : "Thêm Team"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật Team" : "Thêm Team mới"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Chỉnh sửa thông tin cơ bản của Team."
              : "Tạo team mới thuộc một phòng ban."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="teamCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã Team (Team Code)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="TEAM_001"
                      {...field}
                      disabled={isEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Team</FormLabel>
                  <FormControl>
                    <Input placeholder="Wibu Vip Pro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã Phòng Ban (Dept Code)</FormLabel>
                  <FormControl>
                    <Input placeholder="WIBU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
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
                {isEdit ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
