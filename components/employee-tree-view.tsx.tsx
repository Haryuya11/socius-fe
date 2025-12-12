"use client";

import { Building2, Users, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Employee } from "@/types/employee";
import { getFullName, getInitials } from "@/utils/name-utils";

// Helper Avatar (có thể tách ra utils chung nếu muốn)
const PLACEHOLDER_AVATARS = [
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-6.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png",
  "https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-16.png",
];

const getAvatarUrl = (user: Employee) => {
  if (user.imageUrl) return user.imageUrl;
  const sum = user.userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = sum % PLACEHOLDER_AVATARS.length;
  return PLACEHOLDER_AVATARS[index];
};

interface Props {
  data: Employee[];
}

export function EmployeeTreeView({ data }: Props) {
  return (
    <div className="space-y-6">
      {data.map((emp) => (
        <EmployeeNode key={emp.clientId} emp={emp} />
      ))}
    </div>
  );
}

function EmployeeNode({ emp }: { emp: Employee }) {
  const fullName = getFullName(emp.firstName, emp.lastName);
  const avatarUrl = getAvatarUrl(emp);
  const initials = getInitials(emp.firstName, emp.lastName);

  return (
    <Card className="p-5 border-l-4 border-l-primary/40 hover:border-l-primary transition-all shadow-sm">
      {/* 1. ROOT */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border border-border">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              {fullName}
              <Badge
                variant={
                  emp.systemRole === "SYS_ADMIN" ? "destructive" : "secondary"
                }
                className="text-[10px] h-5 px-1.5"
              >
                {emp.systemRole}
              </Badge>
            </h3>
            <div className="flex items-center text-sm text-muted-foreground gap-1">
              <Mail className="h-3.5 w-3.5" />
              {emp.userId}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-8">
          Details
        </Button>
      </div>

      {/* 2. BRANCHES */}
      <div className="mt-4 ml-6 pl-6 border-l-2 border-border/60 space-y-6 relative">
        {/* Departments Branch */}
        <div className="relative">
          <div className="absolute -left-[26px] top-3 h-[2px] w-4 bg-border/60" />
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-2">
            <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-md">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Departments
          </h4>
          <div className="space-y-2 ml-2">
            {emp.departments?.length > 0 ? (
              emp.departments.map((dept, index) => (
                <TreeItem
                  key={dept.departmentCode}
                  isLast={
                    index === emp.departments.length - 1 &&
                    (!emp.teams || emp.teams.length === 0)
                  }
                >
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md border border-border/40 w-fit">
                    <span className="text-sm font-medium">
                      {dept.departmentName}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 font-normal"
                    >
                      {dept.roleName}
                    </Badge>
                    {dept.isPrimary && (
                      <Badge className="text-[10px] h-5 px-1 bg-green-100 text-green-700 hover:bg-green-100">
                        Primary
                      </Badge>
                    )}
                  </div>
                </TreeItem>
              ))
            ) : (
              <TreeItem isLast={!emp.teams || emp.teams.length === 0}>
                <span className="text-sm text-muted-foreground italic">
                  No departments
                </span>
              </TreeItem>
            )}
          </div>
        </div>

        {/* Teams Branch */}
        <div className="relative">
          <div className="absolute -left-[26px] top-3 h-[2px] w-4 bg-border/60" />
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground/80 mb-2">
            <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded-md">
              <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            Teams
          </h4>
          <div className="space-y-2 ml-2">
            {emp.teams?.length > 0 ? (
              emp.teams.map((team, index) => (
                <TreeItem
                  key={team.teamCode}
                  isLast={index === emp.teams.length - 1}
                >
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md border border-border/40 w-fit">
                    <span className="text-sm font-medium">{team.teamName}</span>
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 font-normal"
                    >
                      {team.roleName}
                    </Badge>
                    {team.isLeader && (
                      <span className="text-xs" title="Leader">
                        👑
                      </span>
                    )}
                  </div>
                </TreeItem>
              ))
            ) : (
              <TreeItem isLast>
                <span className="text-sm text-muted-foreground italic">
                  No teams
                </span>
              </TreeItem>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function TreeItem({
  children,
  isLast = false,
}: {
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex items-center pl-6">
      {!isLast && (
        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-border/60" />
      )}
      <div className="absolute left-0 top-0 h-[50%] w-4 border-l-[2px] border-b-[2px] border-border/60 rounded-bl-xl" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
