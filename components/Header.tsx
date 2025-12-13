"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";

import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { SociusLogo } from "./ui/logo";
import { cn } from "@/lib/utils";
import SidebarNav from "./sidebar-nav";
import { ProfileMenu } from "./profile";
import { useMounted } from "@/hooks/use-mounted";

export default function Header({
  className,
  ...rest
}: React.ComponentProps<"header">) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mounted = useMounted();

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
        {/* --- LEFT SIDE: MENU & LOGO --- */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu Trigger */}
          {!mounted ? (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0 -ml-2"
              disabled
            >
              <Menu className="h-6 w-6 text-muted-foreground" />
            </Button>
          ) : (
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
              <SheetContent
                side="left"
                className="p-0 w-72 flex flex-col h-full"
              >
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
          )}

          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:animate-pulse transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
              <SociusLogo
                variant="icon"
                className="h-full w-full text-primary"
              />
            </div>
            <span className="hidden font-bold sm:inline-block">Socius</span>
          </Link>
        </div>

        <div className="flex items-center justify-end gap-1 sm:gap-2 h-full py-4">
          {!mounted ? (
            <>
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Separator
                orientation="vertical"
                className="h-6 bg-border mx-1"
              />
              <Skeleton className="h-8 w-8 rounded-full" />
            </>
          ) : (
            <>
              <ThemeToggle />
              <LanguageSwitcher />

              <Separator
                orientation="vertical"
                className="h-6 bg-border hidden sm:block mx-1"
              />

              <ProfileMenu />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
