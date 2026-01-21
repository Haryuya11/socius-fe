/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  MoreHorizontal,
  ShieldAlert,
  Trash2,
  ArrowRightLeft,
  Crown,
} from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { TeamMember } from "@/types/teams";
import { teamService } from "@/services/team-service";
import { getAvatarInfo } from "@/utils/avatar-utils";
import { getFullImageUrl } from "@/utils/image-utils";
import { TransferMemberDialog } from "./transfer-member-dialog";
import { ConfirmDialog } from "../confirm-dialog";
import { usePermission } from "@/hooks/use-permission"; // [NEW]

interface TeamMemberTableProps {
  members: TeamMember[];
  teamCode: string;
  onRefresh: () => void;
}

export function TeamMemberTable({
  members,
  teamCode,
  onRefresh,
}: TeamMemberTableProps) {
  const t = useTranslations("Teams");
  const [transferMember, setTransferMember] = useState<TeamMember | null>(null);
  const [memberToPromote, setMemberToPromote] = useState<TeamMember | null>(
    null,
  );
  const [isPromoting, setIsPromoting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const { hasPermission } = usePermission();

  const canPromote = hasPermission("team.member.role.update", "TEAM", teamCode);
  const canRemove = hasPermission("team.member.remove", "TEAM", teamCode);
  const canTransfer = canRemove;

  const handleRemove = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);
    try {
      await teamService.removeMembers(teamCode, [
        memberToRemove.employee.clientId,
      ]);
      toast.success(t("members.remove_success"));
      setMemberToRemove(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("members.remove_failed"));
    } finally {
      setIsRemoving(false);
    }
  };

  const handlePromote = async () => {
    if (!memberToPromote) return;
    setIsPromoting(true);
    try {
      await teamService.changeLeader(
        teamCode,
        memberToPromote.employee.clientId,
      );
      toast.success(t("members.promote_success", { name: memberToPromote.employee.firstName }));
      setMemberToPromote(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("members.promote_failed"));
    } finally {
      setIsPromoting(false);
    }
  };

  const hasAnyAction = canPromote || canTransfer || canRemove;

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("members.table.employee")}</TableHead>
              <TableHead>{t("members.table.role")}</TableHead>
              <TableHead>{t("members.table.system_role")}</TableHead>
              <TableHead className="text-right">{t("members.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center h-24 text-muted-foreground"
                >
                  {t("members.table.empty")}
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => {
                const emp = member.employee;
                const { fullName, initials, avatarUrl } = getAvatarInfo(emp);

                return (
                  <TableRow
                    key={emp.clientId}
                    className={member.isLeader ? "bg-muted/30" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={getFullImageUrl(avatarUrl)} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {fullName}
                            {member.isLeader && (
                              <Crown className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {emp.userId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={member.isLeader ? "default" : "secondary"}
                      >
                        {member.isLeader ? t("members.labels.leader") : t("members.labels.member")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {emp.systemRole}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {hasAnyAction && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* Chỉ hiện Bổ nhiệm nếu user có quyền VÀ member này chưa phải Leader */}
                              {canPromote && !member.isLeader && (
                                <DropdownMenuItem
                                  onClick={() => setMemberToPromote(member)}
                                >
                                  <ShieldAlert className="mr-2 h-4 w-4" /> {t(
                                    "members.labels.promote",
                                  )}
                                </DropdownMenuItem>
                              )}

                            {canTransfer && (
                              <DropdownMenuItem
                                onClick={() => setTransferMember(member)}
                              >
                                <ArrowRightLeft className="mr-2 h-4 w-4" /> {t(
                                  "members.labels.transfer",
                                )}
                              </DropdownMenuItem>
                            )}

                            {canTransfer && <DropdownMenuSeparator />}

                            {canRemove && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setMemberToRemove(member)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> {t(
                                  "members.labels.remove",
                                )}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TransferMemberDialog
        open={!!transferMember}
        onOpenChange={(open) => !open && setTransferMember(null)}
        member={transferMember}
        currentTeamCode={teamCode}
        onSuccess={onRefresh}
      />
      <ConfirmDialog
        open={!!memberToPromote}
        onOpenChange={(open) => !open && setMemberToPromote(null)}
        title={t("members.confirm_promote")}
        description={
          <span>
            {t("members.confirm_promote_desc", {
              name: `${memberToPromote?.employee.firstName} ${memberToPromote?.employee.lastName}`,
            })}
            <br />
            <span className="text-xs text-muted-foreground">
              {t("members.confirm_promote_note")}
            </span>
          </span>
        }
        confirmLabel={t("members.confirm_promote_action")}
        isLoading={isPromoting}
        onConfirm={handlePromote}
      />

      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title={t("members.confirm_remove")}
        description={
          <span>
            {t("members.confirm_remove_desc", {
              name: `${memberToRemove?.employee.firstName} ${memberToRemove?.employee.lastName}`,
            })}
          </span>
        }
        confirmLabel={t("members.confirm_remove_action")}
        variant="destructive"
        isLoading={isRemoving}
        onConfirm={handleRemove}
      />
    </>
  );
}
