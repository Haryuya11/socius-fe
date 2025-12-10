"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { Menu } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SociusLogo } from "./ui/logo";
import { cn } from "@/lib/utils";
import SidebarNav from "./SidebarNav";
import { useMounted } from "@/hooks/useMounted";

export default function Header({
  className,
  ...rest
}: React.ComponentProps<"header">) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "h-16 border-b bg-background/40 backdrop-blur-xl supports-backdrop-filter:bg-background/40",
        "flex items-center px-4 sm:px-6 transition-all",
        className
      )}
      {...rest}
    >
      <div className="w-full relative flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0 -ml-2"
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 flex flex-col h-full">
              <VisuallyHidden>
                <SheetTitle>Menu Navigation</SheetTitle>
              </VisuallyHidden>
              <div className="flex items-center h-16 min-h-16 px-4 shrink-0 border-b">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden shrink-0 -ml-2 mr-2"
                  aria-label="Close menu"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 hover:animate-pulse transition-all"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
                    <SociusLogo
                      variant="icon"
                      className="h-full w-full text-primary"
                    />
                  </div>
                  <span className="font-bold">Socius</span>
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarNav onNavClick={() => setIsSidebarOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:animate-pulse transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
              <SociusLogo
                variant="icon"
                className="h-full w-full text-primary "
              />
            </div>
            <span className="hidden font-bold sm:inline-block">Socius</span>
          </Link>
        </div>

        <div className="hidden sm:flex items-center justify-center space-x-2 h-full py-4">
          <ThemeToggle />
          <LanguageSwitcher />
          <Separator orientation="vertical" className="h-6 bg-border" />
        </div>
      </div>
    </header>
  );
}
