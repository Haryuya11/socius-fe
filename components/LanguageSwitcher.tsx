/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Check, Languages } from "lucide-react"; 
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale(); // Lấy ngôn ngữ hiện tại (vi hoặc en-US)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchLanguage = (newLocale: string) => {
    // 1. Lấy pathname hiện tại
    const pathname = window.location.pathname;

    // 2. Lấy các params hiện tại (ví dụ: ?page=2)
    const params = new URLSearchParams(window.location.search);

    // 3. Thêm hoặc cập nhật param 'lang' vào danh sách params
    params.set("lang", newLocale);

    window.location.href = `${pathname}?${params.toString()}`;
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
        <Languages className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
        <span className="sr-only">Loading language</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer">
          <Languages className="h-[1.2rem] w-[1.2rem] text-foreground" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Tiếng Việt */}
        <DropdownMenuItem
          onClick={() => switchLanguage("vi")}
          className={cn(
            "flex items-center justify-between gap-2 cursor-pointer",
            locale === "vi" && "bg-accent font-medium"
          )}
        >
          <span>Tiếng Việt</span>
          {locale === "vi" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>

        {/* Tiếng Anh */}
        <DropdownMenuItem
          onClick={() => switchLanguage("en-US")}
          className={cn(
            "flex items-center justify-between gap-2 cursor-pointer",
            locale === "en-US" && "bg-accent font-medium"
          )}
        >
          <span>English</span>
          {locale === "en-US" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
