/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Save } from "lucide-react";
import { useTranslations } from "next-intl";

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
import { DepartmentSelector } from "@/components/common/department-selector";

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
  const t = useTranslations("Teams");
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
        toast.success(t("dialog.update_action") || "Updated");
      } else {
        await teamService.createTeam(data);
        toast.success(t("dialog.create_success") || "Created");
      }

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || (t("dialog.create_failed") as string) || "Error");
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
            {isEdit ? t("dialog.update_action") : t("dialog.create_action")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("dialog.edit_title") : t("dialog.create_title")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("dialog.edit_description") : t("dialog.create_description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            {/* Mã Team */}
            <FormField
              control={form.control}
              name="teamCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dialog.team_code_label")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="TEAM_001"
                      {...field}
                      disabled={isEdit}
                      className="font-mono uppercase"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tên Team */}
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dialog.team_name_label")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Vd: Mobile App Team" {...field} />
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
                  <FormLabel>{t("dialog.department_label")}</FormLabel>
                  <FormControl>
                    <DepartmentSelector
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tìm và chọn phòng ban..."
                    />
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
                {t("dialog.cancel")}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" />
                {isEdit ? t("dialog.save") : t("dialog.add")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
