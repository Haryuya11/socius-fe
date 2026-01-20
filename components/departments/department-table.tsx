"use client";

import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Trash2,
  Pencil,
  Users,
  ArrowRight,
} from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { usePermission } from "@/hooks/use-permission";

import { Department } from "@/types/department";
import { DepartmentDialog } from "./department-dialog";

interface DepartmentTableProps {
  data: Department[];
  onDelete: (code: string) => void;
  onRefresh: () => void;
}

export function DepartmentTable({
  data,
  onDelete,
  onRefresh,
}: DepartmentTableProps) {
  const router = useRouter();
  const { hasPermission } = usePermission();

  return (
    <Card className="shadow-sm border-border/50 overflow-hidden -py-6">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="w-[150px] pl-6">Mã Phòng Ban</TableHead>

            <TableHead>Tên Phòng Ban</TableHead>

            <TableHead className="text-right pr-6">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((dept) => {
            const canEdit = hasPermission(
              "department.update",
              "DEPARTMENT",
              dept.departmentCode,
            );
            const canDelete = hasPermission(
              "department.delete",
              "DEPARTMENT",
              dept.departmentCode,
            );

            return (
              <TableRow key={dept.departmentCode} className="group">
                <TableCell className="pl-6">
                  <Badge variant="outline" className="font-mono bg-background">
                    {dept.departmentCode}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="font-medium text-base">
                    {dept.departmentName}
                  </div>
                </TableCell>

                <TableCell className="text-right pr-6">
                  <div className="flex justify-end items-center gap-2">
                    <div className="hidden group-hover:flex items-center gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-primary"
                        onClick={() =>
                          router.push(`/departments/${dept.departmentCode}`)
                        }
                      >
                        <Users className="h-4 w-4 mr-1" /> Chi tiết
                      </Button>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/departments/${dept.departmentCode}`)
                          }
                        >
                          <ArrowRight className="mr-2 h-4 w-4" /> Xem chi tiết
                        </DropdownMenuItem>

                        {canEdit && (
                          <DepartmentDialog
                            initialData={dept}
                            onSuccess={onRefresh}
                          >
                            <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full">
                              <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </div>
                          </DepartmentDialog>
                        )}

                        {canDelete && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(dept.departmentCode)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
