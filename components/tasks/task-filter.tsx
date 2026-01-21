"use client";

import * as React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { TeamInfo } from "@/types/teams";
import { TaskStatus, TaskPriority } from "@/types/task";

interface TaskFilterProps {
  teams: TeamInfo[];
  onApply: (filters: FilterState) => void;
  activeFilters: FilterState;
}

export interface FilterState {
  teamCode?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
}

export function TaskFilter({ teams, onApply, activeFilters }: TaskFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<FilterState>(activeFilters);

  // Reset local state khi mở lại popover từ props
  React.useEffect(() => {
    setFilters(activeFilters);
  }, [activeFilters, open]);

  const handleApply = () => {
    onApply(filters);
    setOpen(false);
  };

  const handleReset = () => {
    const emptyState = {};
    setFilters(emptyState);
    onApply(emptyState);
    setOpen(false);
  };

  // Đếm số lượng filter đang active
  const activeCount =
    (filters.teamCode ? 1 : 0) +
    (filters.status?.length || 0) +
    (filters.priority?.length || 0);

  const toggleStatus = (s: TaskStatus) => {
    const current = filters.status || [];
    const next = current.includes(s)
      ? current.filter((item) => item !== s)
      : [...current, s];
    setFilters({ ...filters, status: next.length > 0 ? next : undefined });
  };

  const togglePriority = (p: TaskPriority) => {
    const current = filters.priority || [];
    const next = current.includes(p)
      ? current.filter((item) => item !== p)
      : [...current, p];
    setFilters({ ...filters, priority: next.length > 0 ? next : undefined });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-dashed gap-2">
          <Filter className="h-4 w-4" />
          Bộ lọc
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 rounded-sm">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Bộ lọc nâng cao</h4>
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-destructive"
                onClick={handleReset}
              >
                Xóa lọc
              </Button>
            )}
          </div>
          <Separator />

          {/* 1. Filter Team */}
          <div className="space-y-2">
            <Label>Nhóm / Team</Label>
            <Select
              value={filters.teamCode || "ALL"}
              onValueChange={(val) =>
                setFilters({
                  ...filters,
                  teamCode: val === "ALL" ? undefined : val,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả nhóm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả nhóm</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.teamCode} value={t.teamCode}>
                    {t.teamName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Filter Status */}
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "IN_PROGRESS",
                "PENDING",
                "APPROVED",
                "REJECTED",
                "OVERDUE",
              ].map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={filters.status?.includes(status as TaskStatus)}
                    onCheckedChange={() => toggleStatus(status as TaskStatus)}
                  />
                  <label
                    htmlFor={`status-${status}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {getStatusLabel(status)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Filter Priority */}
          <div className="space-y-2">
            <Label>Độ ưu tiên</Label>
            <div className="flex gap-4">
              {["LOW", "MEDIUM", "HIGH"].map((p) => (
                <div key={p} className="flex items-center space-x-2">
                  <Checkbox
                    id={`prio-${p}`}
                    checked={filters.priority?.includes(p as TaskPriority)}
                    onCheckedChange={() => togglePriority(p as TaskPriority)}
                  />
                  <label
                    htmlFor={`prio-${p}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {p === "LOW"
                      ? "Thấp"
                      : p === "MEDIUM"
                        ? "Trung bình"
                        : "Cao"}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full mt-4" onClick={handleApply}>
            Áp dụng bộ lọc
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function getStatusLabel(s: string) {
  const map: Record<string, string> = {
    IN_PROGRESS: "Đang làm",
    PENDING: "Chờ duyệt",
    APPROVED: "Hoàn thành",
    REJECTED: "Từ chối",
    OVERDUE: "Quá hạn",
  };
  return map[s] || s;
}
