"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const t = useTranslations("Theme");

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <SunMoon className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
        <span className="sr-only">Loading theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer">
          {resolvedTheme === "dark" ? (
            <Moon className="h-[1.2rem] w-[1.2rem] text-foreground" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem] text-foreground" />
          )}
          <span className="sr-only">{t("toggle")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === "light" && "bg-accent font-medium"
          )}
        >
          <Sun className="h-4 w-4" />
          <span>{t("light")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === "dark" && "bg-accent font-medium"
          )}
        >
          <Moon className="h-4 w-4" />
          <span>{t("dark")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === "system" && "bg-accent font-medium"
          )}
        >
          <SunMoon className="h-4 w-4" />
          <span>{t("system")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
