/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

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

import { subTaskSchema, SubTaskFormValues } from "@/lib/validations/task";
import { taskService } from "@/services/task-service";
import { EmployeeSelector } from "@/components/common/employee-selector";
import { Task } from "@/types/task";

interface CreateSubTaskDialogProps {
  parentTask: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateSubTaskDialog({
  parentTask,
  open,
  onOpenChange,
  onSuccess,
}: CreateSubTaskDialogProps) {
  const t = useTranslations("Tasks.subtask");
  const tMessages = useTranslations("Tasks.messages");
  const [loading, setLoading] = useState(false);

  const form = useForm<SubTaskFormValues>({
    resolver: zodResolver(subTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      receiverId: "",
      priority: "MEDIUM",
      startDate: new Date(),
      dueDate: undefined as unknown as Date,
    },
  });

  const onSubmit = async (values: SubTaskFormValues) => {
    const pStart = new Date(parentTask.startDate);
    const pDue = new Date(parentTask.dueDate);

    if (values.startDate < pStart) {
      form.setError("startDate", {
        message: t("date_error_start", { date: format(pStart, "dd/MM") }),
      });
      return;
    }

    if (values.dueDate > pDue) {
      form.setError("dueDate", {
        message: t("date_error_due", { date: format(pDue, "dd/MM") }),
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...values,
        teamCode: parentTask.teamCode,
        departmentCode: parentTask.departmentCode,
        startDate: format(values.startDate, "yyyy-MM-dd"),
        dueDate: format(values.dueDate, "yyyy-MM-dd"),
      };
      await taskService.createSubTask(parentTask.id, payload);
      toast.success(tMessages("subtask_success"));
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || tMessages("subtask_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("create_title")}</DialogTitle>
          <p className="text-xs text-muted-foreground">
            {t("parent_label")} {parentTask.title}
          </p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("title_label")} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="receiverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("receiver_label")} <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <EmployeeSelector
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t("receiver_placeholder")}
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
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">{t("../priority.LOW")}</SelectItem>
                        <SelectItem value="MEDIUM">{t("../priority.MEDIUM")}</SelectItem>
                        <SelectItem value="HIGH">{t("../priority.HIGH")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
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
                          disabled={(date) =>
                            date < new Date(parentTask.startDate)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
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
                          disabled={(date) =>
                            date > new Date(parentTask.dueDate)
                          }
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
                    <Textarea placeholder={t("description_placeholder")} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
                {t("create")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
