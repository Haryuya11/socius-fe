"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import {  buttonVariants } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { employeeService } from "@/services/employee-service";
import { Employee } from "@/types/employee";
import { getAvatarInfo } from "@/utils/avatar-utils";
import { getFullImageUrl } from "@/utils/image-utils";

interface MultiEmployeeSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  excludeIds?: string[]; //  THÊM PROP NÀY
}

export function MultiEmployeeSelector({
  value = [],
  onChange,
  placeholder = "Chọn thành viên...",
  disabled,
  excludeIds = [], // Default value
}: MultiEmployeeSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const [selectedEmployees, setSelectedEmployees] = React.useState<Employee[]>(
    [],
  );

  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    if (!open) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await employeeService.fetchEmployees({
          page: 1,
          size: 50, // Lấy nhiều hơn chút để bù cho việc filter client-side
          condition: { fullName: debouncedQuery },
        });

        // LOGIC LỌC: Loại bỏ những người có trong excludeIds
        const filteredData = res.data.filter(
          (emp) => !excludeIds.includes(emp.clientId),
        );

        setEmployees(filteredData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [debouncedQuery, open, excludeIds]); // Thêm excludeIds vào dependency

  const handleSelect = (employee: Employee) => {
    const isSelected = value.includes(employee.clientId);
    let newValue: string[];
    let newSelected: Employee[];

    if (isSelected) {
      newValue = value.filter((id) => id !== employee.clientId);
      newSelected = selectedEmployees.filter(
        (e) => e.clientId !== employee.clientId,
      );
    } else {
      newValue = [...value, employee.clientId];
      newSelected = [...selectedEmployees, employee];
    }

    onChange(newValue);
    setSelectedEmployees(newSelected);
  };

  const removeTag = (id: string) => {
    onChange(value.filter((v) => v !== id));
    setSelectedEmployees(selectedEmployees.filter((e) => e.clientId !== id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            buttonVariants({ variant: "outline" }), 
            "w-full justify-between h-auto min-h-10 cursor-pointer", 
          )}
        >
          <div className="flex flex-wrap gap-1 items-center text-left">
            {selectedEmployees.length > 0 ? (
              selectedEmployees.map((emp) => (
                <Badge
                  key={emp.clientId}
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {getAvatarInfo(emp).fullName}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") removeTag(emp.clientId);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeTag(emp.clientId);
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] p-0"
        align="start"
        onWheel={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Tìm nhân viên..."
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
              <CommandEmpty>Không tìm thấy nhân viên phù hợp.</CommandEmpty>
            )}
            <CommandGroup>
              <div className="max-h-[200px] overflow-y-auto">
                {employees.map((employee) => {
                  const isSelected = value.includes(employee.clientId);
                  const { fullName, initials, avatarUrl } =
                    getAvatarInfo(employee);
                  return (
                    <CommandItem
                      key={employee.clientId}
                      value={employee.clientId}
                      onSelect={() => handleSelect(employee)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <Check className={cn("h-4 w-4")} />
                      </div>
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
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
