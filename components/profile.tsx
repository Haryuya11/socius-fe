"use client";

import { LogOut, User, Settings, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getAvatarInfo } from "@/utils/avatar-utils";
import { UserProfile } from "@/types/user";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const t = useTranslations("Profile");

  const { fullName, initials, avatarUrl } = getAvatarInfo(user as UserProfile);

  if (!user) return null;

  const handleLogout = () => {
    toast.success(t("logged_out_success"));
    logout();
    router.push("/login");
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-all hover:bg-accent/50"
        >
          <Avatar className="h-9 w-9 border border-border/50 transition-all duration-200 hover:border-primary/50 hover:shadow-md">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={fullName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72" align="end" forceMount>
        <DropdownMenuLabel className="font-normal px-0 py-0">
          <div className="bg-linear-to-b from-primary/5 to-transparent px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-sm">
                <AvatarImage
                  src={avatarUrl || "/placeholder.svg"}
                  alt={fullName}
                />
                <AvatarFallback className="bg-primary/15 text-primary font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {fullName}
                </p>
                <p className="text-xs text-muted-foreground/80 truncate">
                  {user.userId}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
                {user.systemRole || "Member"}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuGroup className="py-1">
          <DropdownMenuItem asChild className="cursor-pointer group">
            <Link href="/profile" className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <User className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="group-hover:text-foreground transition-colors">
                  {t("my_profile")}
                </span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all" />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer group">
            <Link
              href="/settings"
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1">
                <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="group-hover:text-foreground transition-colors">
                  {t("settings")}
                </span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all" />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          className="cursor-pointer text-destructive/80 hover:text-destructive hover:bg-destructive/8 focus:text-destructive focus:bg-destructive/10 transition-colors my-0.5 mx-1 px-3 py-2 rounded-sm"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="font-medium">{t("logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
