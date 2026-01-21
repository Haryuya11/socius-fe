/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { employeeService } from "@/services/employee-service";
import { teamService } from "@/services/team-service";
import { Employee } from "@/types/employee";
import { getAvatarInfo } from "@/utils/avatar-utils";
import { getFullImageUrl } from "@/utils/image-utils";
import { usePermission } from "@/hooks/use-permission"; // [NEW]

interface AddMemberDialogProps {
  teamCode: string;
  onSuccess: () => void;
  children?: React.ReactNode;
}

export function AddMemberDialog({
  teamCode,
  onSuccess,
  children,
}: AddMemberDialogProps) {
  const t = useTranslations("Teams");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { hasPermission } = usePermission();
  const canAddMember = hasPermission("team.member.add", "TEAM", teamCode);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await employeeService.fetchEmployees({
          page: 1,
          size: 20,
          condition: { fullName: debouncedQuery },
        });
        setResults(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    };
    search();
  }, [debouncedQuery]);

  const handleSearch = async (val: string) => {
    setQuery(val);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const payload = selectedIds.map((id) => ({ employeeId: id }));
      await teamService.addMembers(teamCode, payload);
      toast.success(t("add_member.added_success", { count: selectedIds.length }));
      setOpen(false);
      setSelectedIds([]);
      setQuery("");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("add_member.add_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nếu không có quyền, không render nút trigger
  if (!canAddMember) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
          {children ? (
          children
        ) : (
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" /> {t("add_member.add_button")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("add_member.title", { code: teamCode })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("add_member.search_placeholder")}
              className="pl-9"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[300px] border rounded-md p-2">
            {isSearching ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : results.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground p-4">
                {query ? t("add_member.no_results") : t("add_member.hint")}
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((emp) => {
                  const { fullName, initials, avatarUrl } = getAvatarInfo(emp);
                  const isSelected = selectedIds.includes(emp.clientId);

                  return (
                    <div
                      key={emp.clientId}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                      onClick={() => toggleSelection(emp.clientId)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getFullImageUrl(avatarUrl)} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">
                          {fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {emp.userId}
                        </p>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("dialog.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedIds.length === 0}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("dialog.add")} ({selectedIds.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
