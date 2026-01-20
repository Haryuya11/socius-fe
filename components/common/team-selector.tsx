/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, Users } from "lucide-react";
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
import { teamService } from "@/services/team-service";
import { Team } from "@/types/teams";

interface TeamSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  defaultLabel?: string;
  departmentCode?: string;
}

export function TeamSelector({
  value,
  onChange,
  placeholder = "Chọn nhóm (Team)...",
  disabled,
  defaultLabel,
  departmentCode,
}: TeamSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    if (departmentCode && selectedTeam?.departmentCode !== departmentCode) {
      // Optional: Logic reset nếu cần
    }
  }, [departmentCode]);

  React.useEffect(() => {
    if (!open) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await teamService.fetchTeams({
          page: 1,
          size: 50, // Tăng size
          condition: {
            teamName: debouncedQuery,
            departmentCode: departmentCode || undefined,
          },
        });
        setTeams(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [debouncedQuery, open, departmentCode]);

  const displayLabel = selectedTeam
    ? selectedTeam.teamName
    : defaultLabel || (value ? value : placeholder);

  React.useEffect(() => {
    if (!value) setSelectedTeam(null);
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
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
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
            placeholder="Tìm team..."
            value={query}
            onValueChange={setQuery}
          />
          {/* [FIX] Thêm max-h và overflow */}
          <CommandList className="max-h-[250px] overflow-y-auto overflow-x-hidden">
            {loading && (
              <div className="p-4 flex justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && teams.length === 0 && (
              <CommandEmpty>Không tìm thấy team.</CommandEmpty>
            )}
            <CommandGroup>
              {teams.map((team) => (
                <CommandItem
                  key={team.teamCode}
                  value={team.teamCode}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setSelectedTeam(team);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === team.teamCode ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">
                      {team.teamName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {team.teamCode}
                      {!departmentCode && ` • ${team.departmentCode}`}
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
