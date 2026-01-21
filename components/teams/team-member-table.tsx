/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
  const [transferMember, setTransferMember] = useState<TeamMember | null>(null);

  const [memberToPromote, setMemberToPromote] = useState<TeamMember | null>(
    null
  );
  const [isPromoting, setIsPromoting] = useState(false);

  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);
    try {
      await teamService.removeMembers(teamCode, [
        memberToRemove.employee.clientId,
      ]);
      toast.success("Đã xóa thành viên khỏi nhóm");
      setMemberToRemove(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Xóa thất bại");
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
        memberToPromote.employee.clientId
      );
      toast.success(
        `Đã bổ nhiệm ${memberToPromote.employee.firstName} làm Leader`
      );
      setMemberToPromote(null);
      onRefresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Bổ nhiệm thất bại");
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>System Role</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center h-24 text-muted-foreground"
                >
                  Chưa có thành viên nào.
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
                        {member.isLeader ? "Leader" : "Member"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {emp.systemRole}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
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
                          {!member.isLeader && (
                            <DropdownMenuItem
                              onClick={() => setMemberToPromote(member)}
                            >
                              <ShieldAlert className="mr-2 h-4 w-4" /> Bổ nhiệm
                              Leader
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setTransferMember(member)}
                          >
                            <ArrowRightLeft className="mr-2 h-4 w-4" /> Điều
                            chuyển (Transfer)
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setMemberToRemove(member)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa khỏi nhóm
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        title="Bổ nhiệm Team Leader"
        description={
          <span>
            Bạn có chắc muốn bổ nhiệm{" "}
            <strong>
              {memberToPromote?.employee.firstName}{" "}
              {memberToPromote?.employee.lastName}
            </strong>{" "}
            làm Leader mới của nhóm?
            <br />
            <span className="text-xs text-muted-foreground">
              (Leader hiện tại sẽ trở thành thành viên thường)
            </span>
          </span>
        }
        confirmLabel="Bổ nhiệm"
        isLoading={isPromoting}
        onConfirm={handlePromote}
      />

      {/* Dialog Xóa thành viên */}
      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title="Xóa thành viên"
        description={
          <span>
            Bạn có chắc muốn xóa{" "}
            <strong>
              {memberToRemove?.employee.firstName}{" "}
              {memberToRemove?.employee.lastName}
            </strong>{" "}
            khỏi nhóm này không?
          </span>
        }
        confirmLabel="Xóa thành viên"
        variant="destructive"
        isLoading={isRemoving}
        onConfirm={handleRemove}
      />
    </>
  );
}
