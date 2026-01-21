/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

import { teamService } from "@/services/team-service";
import { TeamMember } from "@/types/teams";

const transferSchema = z.object({
  toTeamCode: z.string().min(1, "Vui lòng chọn team đích"),
});

interface TransferMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  currentTeamCode: string;
  onSuccess: () => void;
}

export function TransferMemberDialog({
  open,
  onOpenChange,
  member,
  currentTeamCode,
  onSuccess,
}: TransferMemberDialogProps) {
  // Thực tế bạn cần 1 API get all teams hoặc search teams để đổ vào Select
  // Ở đây tôi mock tạm data hoặc bạn dùng lại teamService.fetchTeams
  const [teams, setTeams] = useState<{ code: string; name: string }[]>([]);

  const t = useTranslations("Teams");

  const form = useForm<{ toTeamCode: string }>({
    resolver: zodResolver(transferSchema),
    defaultValues: { toTeamCode: "" },
  });

  useEffect(() => {
    // Fetch list team để chọn (loại trừ team hiện tại)
    const loadTeams = async () => {
      try {
        const res = await teamService.fetchTeams({ page: 1, size: 100 });
        setTeams(
          res.data
            .filter((t) => t.teamCode !== currentTeamCode)
            .map((t) => ({ code: t.teamCode, name: t.teamName }))
        );
      } catch (e) {
        console.error(e);
      }
    };
    if (open) loadTeams();
  }, [open, currentTeamCode]);

  const onSubmit = async (values: { toTeamCode: string }) => {
    if (!member) return;
    try {
      await teamService.transferMember({
        employeeId: member.employee.clientId,
        fromTeamCode: currentTeamCode,
        toTeamCode: values.toTeamCode,
      });
      toast.success(t("transfer.transfer_success"));
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const msg = error?.response?.data?.message || t("transfer.transfer_failed");
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("transfer.transfer_title")}</DialogTitle>
          <DialogDescription>
            {t("transfer.transfer_desc_prefix")} {" "}
            <strong>
              {member?.employee.firstName} {member?.employee.lastName}
            </strong>{" "}
            {t("transfer.transfer_desc_suffix")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="toTeamCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("transfer.to_label")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("transfer.to_placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams.map((t) => (
                        <SelectItem key={t.code} value={t.code}>
                          {t.name} ({t.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                {t("transfer.transfer")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
