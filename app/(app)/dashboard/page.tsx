"use client";

import { authUtils } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";
import { getAvatarInfo } from "@/utils/avatar-utils";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const t = useTranslations("Dashboard");
  const { user, isLoading, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const { fullName, initials, avatarUrl } = getAvatarInfo(user);

  const handleCopyToken = () => {
    const token = authUtils.getToken();
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      toast.success(t("token_copied"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-content-screen w-full flex-col items-center justify-center gap-6 bg-muted/20 p-8">
      <div className="flex flex-col items-center gap-4 text-center max-w-2xl w-full">
        <h1 className="text-3xl font-bold tracking-tight">{t("welcome")}</h1>

        <div className="w-full rounded-xl border bg-card p-6 text-card-foreground shadow-sm animate-in fade-in zoom-in duration-300">
          {/* Header Profile */}
          <div className="flex items-center gap-4 border-b pb-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={avatarUrl || "/placeholder.svg"}
                alt={fullName}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <h2 className="text-xl font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{user.systemRole}</p>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
              <span className="font-semibold text-muted-foreground">
                {t("email")}
              </span>
              <span className="font-medium">{user.userId}</span>
            </div>

            <div className="grid grid-cols-[100px_1fr] gap-2 items-start">
              <span className="font-semibold text-muted-foreground mt-1">
                {t("departments")}
              </span>
              <div className="flex flex-wrap gap-1">
                {user.departments.map((dept) => (
                  <span
                    key={dept.departmentCode}
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {dept.departmentName} ({dept.roleName})
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[100px_1fr] gap-2 items-start">
              <span className="font-semibold text-muted-foreground mt-1">
                {t("teams")}
              </span>
              <div className="flex flex-wrap gap-1">
                {user.teams.map((team) => (
                  <span
                    key={team.teamCode}
                    className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"
                  >
                    {team.teamName} {team.isLeader && "👑"}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-[100px_1fr] gap-2 items-center pt-2">
              <span className="font-semibold text-muted-foreground">
                {t("token")}
              </span>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted p-1.5 rounded text-xs text-muted-foreground font-mono truncate">
                  {authUtils.getToken()?.slice(0, 20)}...
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopyToken}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button variant="destructive" onClick={logout}>
        {t("logout")}
      </Button>
    </div>
  );
}
