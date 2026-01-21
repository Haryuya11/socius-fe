/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// [FIX] Import thêm useMemo
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createTaskSchema } from "@/lib/validations/task";
import { taskService } from "@/services/task-service";
import { Task } from "@/types/task";
import { EmployeeSelector } from "@/components/common/employee-selector";
import { usePermission } from "@/hooks/use-permission";
import { useAuth } from "@/hooks/use-auth";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Task | null;
  onSuccess: () => void;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: TaskFormDialogProps) {
  const t = useTranslations("Tasks.form");
  const tMessages = useTranslations("Tasks.messages");
  const tPriority = useTranslations("Tasks.priority");
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { getTeamsWithPermission } = usePermission();

  const allowedTeamCodes = getTeamsWithPermission("task.create");

  const selectableTeams = useMemo(() => {
    return (
      user?.teams.filter((t) => allowedTeamCodes.includes(t.teamCode)) || []
    );
  }, [user?.teams, allowedTeamCodes]);

  const form = useForm({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      receiverId: "",
      teamCode: "",
      departmentCode: "",
      priority: "MEDIUM",
      startDate: new Date(),
      dueDate: undefined,
    },
  });

  const watchTeamCode = form.watch("teamCode");

  useEffect(() => {
    if (watchTeamCode && !isEdit) {
      if (user && user.departments && user.departments.length > 0) {
        form.setValue("departmentCode", user.departments[0].departmentCode);
      }
    }
  }, [watchTeamCode, isEdit, user, selectableTeams, form]);

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description || "",
        receiverId: initialData.receiverId,
        teamCode: initialData.teamCode,
        departmentCode: initialData.departmentCode,
        priority: (initialData.priority || "MEDIUM") as any,
        startDate: new Date(initialData.startDate),
        dueDate: new Date(initialData.dueDate),
      });
    } else if (open) {
      form.reset({
        title: "",
        description: "",
        receiverId: "",
        teamCode: "",
        departmentCode: "", // Sẽ được useEffect trên điền nếu chọn team
        priority: "MEDIUM",
        startDate: new Date(),
        dueDate: undefined,
      });
    }
  }, [open, initialData, form]);

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        startDate: format(values.startDate, "yyyy-MM-dd"),
        dueDate: format(values.dueDate, "yyyy-MM-dd"),
      };

      if (isEdit && initialData) {
        await taskService.updateTask(initialData.id, payload);
        toast.success(tMessages("update_success"));
      } else {
        await taskService.createTask(payload);
        toast.success(tMessages("create_success"));
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || tMessages("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("title_edit") : t("title_create")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("title_label")} <span className="text-red-500">{t("required")}</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("title_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="teamCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("team_label")} <span className="text-red-500">{t("required")}</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isEdit}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("team_placeholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectableTeams.map((t) => (
                          <SelectItem key={t.teamCode} value={t.teamCode}>
                            {t.teamName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="departmentCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dept_label")}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="receiverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("receiver_label")} <span className="text-red-500">{t("required")}</span>
                    </FormLabel>
                    <FormControl>
                      <EmployeeSelector
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t("receiver_placeholder")}
                        defaultLabel={initialData?.receiverName}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("priority_label")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("priority_placeholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">{tPriority("LOW")}</SelectItem>
                        <SelectItem value="MEDIUM">{tPriority("MEDIUM")}</SelectItem>
                        <SelectItem value="HIGH">{tPriority("HIGH")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("start_date_label")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>{t("select_date")}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("due_date_label")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>{t("select_date")}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description_label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("description_placeholder")}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> {t("save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
