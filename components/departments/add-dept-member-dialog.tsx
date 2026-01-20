/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EmployeeSelector } from "@/components/common/employee-selector"; 
import { departmentService } from "@/services/department-service";

export function AddDeptMemberDialog({
  deptCode,
  onSuccess,
}: {
  deptCode: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [empId, setEmpId] = useState("");
  const [roleCode, setRoleCode] = useState("DEPT_MEM");
  const [isPrimary, setIsPrimary] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!empId) return;
    setSubmitting(true);
    try {
      const payload = [
        {
          employeeId: empId,
          roleCode,
          isPrimary,
        },
      ];
      await departmentService.addMembers(deptCode, payload);
      toast.success("Thêm thành viên thành công");
      setOpen(false);
      setEmpId("");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <UserPlus className="h-4 w-4" /> Thêm thành viên
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Thêm nhân sự vào {deptCode}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Chọn nhân viên</Label>
            <EmployeeSelector
              value={empId}
              onChange={setEmpId}
              placeholder="Tìm theo tên hoặc email..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vai trò</Label>
              <Select value={roleCode} onValueChange={setRoleCode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEPT_MEM">Thành viên (MEM)</SelectItem>
                  <SelectItem value="DEPT_MGR">Quản lý (MGR)</SelectItem>
                  <SelectItem value="DEPT_DIR">Giám đốc (DIR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col justify-end pb-2 space-y-2">
              <div className="flex items-center justify-between border p-2 rounded-lg">
                <Label htmlFor="is-primary" className="cursor-pointer">
                  Phòng chính?
                </Label>
                <Switch
                  checked={isPrimary}
                  onCheckedChange={setIsPrimary}
                  id="is-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !empId}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Thêm nhân sự
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
