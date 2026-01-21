"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  UserX,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { DepartmentMember } from "@/types/department";
import { departmentService } from "@/services/department-service";
import { getAvatarInfo } from "@/utils/avatar-utils";
import { getFullImageUrl } from "@/utils/image-utils";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { TransferDeptMemberDialog } from "./transfer-dept-member-dialog";
import { usePermission } from "@/hooks/use-permission";
import { ROLE_LABELS, DEPT_ROLES, ROLE_COLORS, RoleCode } from "@/types/roles";
import { useTranslations } from "next-intl";

interface Props {
  members: DepartmentMember[];
  deptCode: string;
  onRefresh: () => void;
}

export function DepartmentMemberTable({ members, deptCode, onRefresh }: Props) {
  const t = useTranslations("Departments");
  const [memberToRemove, setMemberToRemove] = useState<DepartmentMember | null>(
    null,
  );
  const [memberToTransfer, setMemberToTransfer] =
    useState<DepartmentMember | null>(null);
  const { hasPermission } = usePermission();

  // --- PHÂN QUYỀN ---
  const canUpdateRole = hasPermission(
    "department.member.role.update",
    "DEPARTMENT",
    deptCode,
  );
  const canRemoveMember = hasPermission(
    "department.member.remove",
    "DEPARTMENT",
    deptCode,
  );

  const canAction = canUpdateRole || canRemoveMember;

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await departmentService.updateMemberRole(deptCode, memberId, newRole);
      toast.success(t("member.update_role_success") || "Role updated successfully");
      onRefresh();
    } catch (e) {
      toast.error(t("member.update_role_failed") || "Failed to update role");
    }
  };

  const handleRemove = async () => {
    if (!memberToRemove) return;
    try {
      await departmentService.removeMembers(deptCode, [
        memberToRemove.employee.clientId,
      ]);
      toast.success(t("member.remove_success") || "Member removed from department");
      onRefresh();
    } catch (e) {
      toast.error(t("member.remove_failed") || "Remove failed");
    } finally {
      setMemberToRemove(null);
    }
  };

  return (
    <>
      {/* [STYLE FIX] Dùng bg-card và border mặc định để giống Team */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.employee") || "Employee"}</TableHead>
              <TableHead>{t("table.role") || "Role"}</TableHead>
              <TableHead>{t("table.status") || "Status"}</TableHead>
              <TableHead className="text-right">{t("actions_label") || "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("member.empty") || "No members found."}
                  </TableCell>
              </TableRow>
            ) : (
              members.map((m) => {
                const { fullName, initials, avatarUrl } = getAvatarInfo(
                  m.employee,
                );
                const isDirector = m.roleCode === DEPT_ROLES.DIRECTOR;

                // Lấy màu từ file roles.ts nhưng map về variant của Badge shadcn
                const badgeVariant =
                  ROLE_COLORS[m.roleCode as RoleCode] === "yellow"
                    ? "default"
                    : ROLE_COLORS[m.roleCode as RoleCode] === "blue"
                      ? "secondary"
                      : "outline";

                return (
                  <TableRow
                    key={m.employee.clientId}
                    // [STYLE FIX] Highlight dòng Director giống như Leader của Team
                    className={isDirector ? "bg-muted/30" : ""}
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
                            {/* Icon vương miện cho Giám đốc */}
                            {isDirector && (
                              <Crown className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {m.employee.userId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant}>
                        {ROLE_LABELS[m.roleCode as RoleCode] || m.roleCode}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {m.isPrimary ? (
                        <Badge
                          variant="outline"
                          className="font-normal text-xs"
                        >
                          {t("member.primary") || "Primary"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {t("member.secondary") || "Secondary"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {canAction && (
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
                            {canUpdateRole && (
                              <>
                                <DropdownMenuLabel>
                                  {t("member.change_role") || "Change role"}
                                </DropdownMenuLabel>
                                <DropdownMenuRadioGroup
                                  value={m.roleCode}
                                  onValueChange={(val) =>
                                    handleRoleChange(m.employee.clientId, val)
                                  }
                                >
                                  {/* Render option động từ roles.ts */}
                                  {Object.values(DEPT_ROLES).map(
                                    (roleValue) => (
                                      <DropdownMenuRadioItem
                                        key={roleValue}
                                        value={roleValue}
                                      >
                                        {ROLE_LABELS[roleValue]}
                                      </DropdownMenuRadioItem>
                                    ),
                                  )}
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator />
                              </>
                            )}

                            {canRemoveMember && (
                              <DropdownMenuItem
                                onClick={() => setMemberToTransfer(m)}
                              >
                                <ArrowRightLeft className="mr-2 h-4 w-4" /> {t("member.transfer") || "Transfer"}
                              </DropdownMenuItem>
                            )}

                            {canRemoveMember && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setMemberToRemove(m)}
                              >
                                <UserX className="mr-2 h-4 w-4" /> {t("member.remove") || "Remove from group"}
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

      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(o) => !o && setMemberToRemove(null)}
        title={t("member.confirm_title") || "Remove member"}
        description={
          <span>
            {t("member.confirm_desc_prefix") || "Are you sure to remove"} {" "}
            <strong>
              {memberToRemove?.employee.firstName} {" "}
              {memberToRemove?.employee.lastName}
            </strong>{" "}
            {t("member.confirm_desc_suffix") || "from the department?"}
          </span>
        }
        onConfirm={handleRemove}
        confirmLabel={t("member.confirm_action") || "Remove member"}
        variant="destructive"
      />

      {memberToTransfer && (
        <TransferDeptMemberDialog
          open={!!memberToTransfer}
          onOpenChange={(o) => !o && setMemberToTransfer(null)}
          member={memberToTransfer}
          currentDeptCode={deptCode}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
