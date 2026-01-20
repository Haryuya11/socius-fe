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

interface Props {
  members: DepartmentMember[];
  deptCode: string;
  onRefresh: () => void;
}

export function DepartmentMemberTable({ members, deptCode, onRefresh }: Props) {
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
      toast.success("Cập nhật vai trò thành công");
      onRefresh();
    } catch (e) {
      toast.error("Lỗi cập nhật vai trò");
    }
  };

  const handleRemove = async () => {
    if (!memberToRemove) return;
    try {
      await departmentService.removeMembers(deptCode, [
        memberToRemove.employee.clientId,
      ]);
      toast.success("Đã xóa nhân viên khỏi phòng ban");
      onRefresh();
    } catch (e) {
      toast.error("Xóa thất bại");
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
              <TableHead>Nhân viên</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
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
                          Chính
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Phụ
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
                                  Thay đổi vai trò
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
                                <ArrowRightLeft className="mr-2 h-4 w-4" /> Điều
                                chuyển
                              </DropdownMenuItem>
                            )}

                            {canRemoveMember && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setMemberToRemove(m)}
                              >
                                <UserX className="mr-2 h-4 w-4" /> Xóa khỏi nhóm
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
        title="Xóa thành viên"
        description={
          <span>
            Bạn có chắc muốn xóa{" "}
            <strong>
              {memberToRemove?.employee.firstName}{" "}
              {memberToRemove?.employee.lastName}
            </strong>{" "}
            khỏi phòng ban?
          </span>
        }
        onConfirm={handleRemove}
        confirmLabel="Xóa thành viên"
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
