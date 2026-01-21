"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Building2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { departmentService } from "@/services/department-service";
import { Department } from "@/types/department";

interface DepartmentSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  defaultLabel?: string;
}

export function DepartmentSelector({
  value,
  onChange,
  placeholder = "Chọn phòng ban...",
  disabled,
  defaultLabel,
}: DepartmentSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedDept, setSelectedDept] = React.useState<Department | null>(
    null,
  );

  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    if (!open) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await departmentService.fetchDepartments({
          page: 1,
          size: 50, // Tăng size lên để load nhiều hơn khi scroll
          condition: { departmentName: debouncedQuery },
        });
        setDepartments(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [debouncedQuery, open]);

  const displayLabel = selectedDept
    ? selectedDept.departmentName
    : defaultLabel || (value ? value : placeholder);

  React.useEffect(() => {
    if (!value) setSelectedDept(null);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between pl-3 font-normal"
          disabled={disabled}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <span
              className={cn(
                "truncate",
                !value && !defaultLabel && "text-muted-foreground",
              )}
            >
              {displayLabel}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0"
        align="start"
        onWheel={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Tìm phòng ban..."
            value={query}
            onValueChange={setQuery}
          />
          {/* [FIX] Thêm max-h và overflow để scroll được */}
          <CommandList className="max-h-[250px] overflow-y-auto overflow-x-hidden">
            {loading && (
              <div className="p-4 flex justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && departments.length === 0 && (
              <CommandEmpty>Không tìm thấy phòng ban.</CommandEmpty>
            )}
            <CommandGroup>
              {departments.map((dept) => (
                <CommandItem
                  key={dept.departmentCode}
                  value={dept.departmentCode}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setSelectedDept(dept);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === dept.departmentCode
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">
                      {dept.departmentName}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {dept.departmentCode}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
