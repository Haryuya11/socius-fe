"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, User } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { employeeService } from "@/services/employee-service"; // Đảm bảo đường dẫn đúng service của bạn
import { Employee } from "@/types/employee";
import { getAvatarInfo } from "@/utils/avatar-utils";
import { getFullImageUrl } from "@/utils/image-utils";

interface EmployeeSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  defaultLabel?: string; // [FIX] Nhận tên có sẵn
}

export function EmployeeSelector({
  value,
  onChange,
  placeholder = "Chọn nhân viên...",
  disabled,
  defaultLabel,
}: EmployeeSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedEmployee, setSelectedEmployee] =
    React.useState<Employee | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    if (!open) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await employeeService.fetchEmployees({
          page: 1,
          size: 20,
          condition: { fullName: debouncedQuery },
        });
        setEmployees(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [debouncedQuery, open]);

  const displayLabel = selectedEmployee
    ? getAvatarInfo(selectedEmployee).fullName
    : defaultLabel || value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between pl-3 font-normal"
          disabled={disabled}
        >
          {value ? (
            <div className="flex items-center gap-2 overflow-hidden">
              {selectedEmployee ? (
                <Avatar className="h-5 w-5">
                  <AvatarImage
                    src={getFullImageUrl(selectedEmployee.imageUrl)}
                  />
                  <AvatarFallback className="text-[10px]">
                    {selectedEmployee.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className="truncate">{displayLabel}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Tìm theo tên..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && (
              <div className="p-4 flex justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!loading && employees.length === 0 && (
              <CommandEmpty>Không tìm thấy.</CommandEmpty>
            )}
            <CommandGroup>
              {employees.map((employee) => {
                const { fullName, initials, avatarUrl } =
                  getAvatarInfo(employee);
                return (
                  <CommandItem
                    key={employee.clientId}
                    value={employee.clientId}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setSelectedEmployee(employee);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === employee.clientId
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={getFullImageUrl(avatarUrl)} />
                      <AvatarFallback className="text-[10px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{fullName}</span>
                      <span className="text-xs text-muted-foreground">
                        {employee.userId}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
