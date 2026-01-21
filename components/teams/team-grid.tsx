import { useRouter } from "next/navigation";
import {
  Building2,
  Hash,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { Team } from "@/types/teams";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TeamDialog } from "./team-dialog";
// [NEW] Import hook permission
import { usePermission } from "@/hooks/use-permission";

interface TeamGridProps {
  data: Team[];
  onDelete: (code: string) => void;
  onSuccess: () => void;
}

export function TeamGrid({ data, onDelete, onSuccess }: TeamGridProps) {
  const router = useRouter();
  const { hasPermission } = usePermission();
  const t = useTranslations("Teams");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <Card
            key={team.teamCode}
            className="group hover:shadow-lg transition-all duration-300 border-border/60"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Users className="h-5 w-5" />
                </div>

                {hasAction && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mr-2 text-muted-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canView && (
                        <DropdownMenuItem
                          onClick={() => router.push(`/teams/${team.teamCode}`)}
                        >
                          {t("actions.view")}
                        </DropdownMenuItem>
                      )}

                      {canUpdate && (
                        <TeamDialog initialData={team} onSuccess={onSuccess}>
                          <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full">
                            <Pencil className="mr-2 h-4 w-4" /> {t("actions.edit")}
                          </div>
                        </TeamDialog>
                      )}

                      {canDelete && (
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(team.teamCode)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> {t("actions.delete")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <CardTitle
                className="text-lg font-bold line-clamp-1"
                title={team.teamName}
              >
                {team.teamName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                <Hash className="mr-2 h-4 w-4 opacity-70" />
                <span className="font-mono text-xs">{team.teamCode}</span>
              </div>
                <div className="flex items-center text-sm">
                <Building2 className="mr-2 h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground mr-2">{t("tree.dept_label")}:</span>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {team.departmentCode}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              {/* Nút truy cập nhanh cũng check quyền View */}
              {canView && (
                <Button
                  variant="outline"
                  className="w-full hover:bg-primary hover:text-primary-foreground group-hover:border-primary/50"
                  onClick={() => router.push(`/teams/${team.teamCode}`)}
                >
                  {t("actions.manage_members")}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
