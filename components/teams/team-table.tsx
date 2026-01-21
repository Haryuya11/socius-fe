"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2, Pencil } from "lucide-react";
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
import { Team } from "@/types/teams";
import { TeamDialog } from "./team-dialog";
// [NEW]
import { usePermission } from "@/hooks/use-permission";

interface TeamTableProps {
  data: Team[];
  onDelete: (code: string) => void;
  onSuccess: () => void;
}

export function TeamTable({ data, onDelete, onSuccess }: TeamTableProps) {
  const router = useRouter();
  const { hasPermission } = usePermission();

  return (
    <Card className="shadow-sm border-border/50 overflow-hidden -py-6">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
            <TableHead className="font-semibold pl-6">Mã Team</TableHead>
            <TableHead className="font-semibold">Tên Team</TableHead>
            <TableHead className="font-semibold">Phòng Ban</TableHead>
            <TableHead className="text-right font-semibold pr-6">
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((team) => {
            const canUpdate =
              hasPermission("team.update", "TEAM", team.teamCode) ||
              hasPermission("team.update", "DEPARTMENT", team.departmentCode);
            const canDelete =
              hasPermission("team.delete", "TEAM", team.teamCode) ||
              hasPermission("team.delete", "DEPARTMENT", team.departmentCode);
            const canView =
              hasPermission("team.view", "TEAM", team.teamCode) ||
              hasPermission("team.view", "DEPARTMENT", team.departmentCode);
            const hasAction = canUpdate || canDelete || canView;

            return (
              <TableRow
                key={team.teamCode}
                className="hover:bg-muted/40 transition-colors border-border/50"
              >
                <TableCell className="font-mono font-medium pl-6">
                  {team.teamCode}
                </TableCell>
                <TableCell className="font-semibold">{team.teamName}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-800"
                  >
                    {team.departmentCode}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  {hasAction && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted/50"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canView && (
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/teams/${team.teamCode}`)
                            }
                            className="cursor-pointer"
                          >
                            Xem chi tiết
                          </DropdownMenuItem>
                        )}

                        {canUpdate && (
                          <TeamDialog initialData={team} onSuccess={onSuccess}>
                            <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full">
                              <Pencil className="mr-2 h-3.5 w-3.5" /> Chỉnh sửa
                            </div>
                          </TeamDialog>
                        )}

                        {canDelete && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => onDelete(team.teamCode)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa Team
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
