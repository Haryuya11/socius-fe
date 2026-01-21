"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { UserAuthForm } from "@/components/UserAuthForm";
import { ThemeToggle } from "@/components/theme-toggle";
import { GridPattern } from "@/components/grid-pattern";
import { DashboardMockup } from "@/components/dashboard-mockup";
import { LanguageSwitcher } from "@/components/language-switcher";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { SociusLogo } from "@/components/ui/logo";

export default function AuthenticationPage() {
  const t = useTranslations("Auth");

  return (
    <>
      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0 overflow-hidden">
        <div className="absolute right-4 top-4 md:right-8 md:top-8 flex items-center gap-4 z-50">
          <Link
            href="/examples/authentication"
            className="text-sm font-medium hover:underline text-muted-foreground"
          >
            {t("help")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="relative hidden h-full flex-col p-10 text-muted-foreground lg:flex dark:border-r overflow-hidden bg-muted">
          <div className="absolute inset-0 bg-size-[400%_400%] bg-linear-to-br from-muted via-background/50 to-muted animate-gradient-slow opacity-60" />
          <GridPattern className="opacity-50 mask-[radial-gradient(400px_circle_at_center,white,transparent)]" />

          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-chart-1/30 blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-ring/30 blur-3xl animate-float [animation-delay:2s]" />

          <div className="relative z-20 flex items-center text-lg font-medium gap-2">
            <SociusLogo
              variant="full"
              className="h-10 w-auto text-primary fill-current animate-pulse"
            />
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center w-full px-4 perspective-[1000px]">
            <DashboardMockup />
          </div>

          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-4">
              <TypewriterText
                text={`“${t("slogan")}”`}
                className="text-lg font-medium leading-relaxed
                bg-clip-text text-transparent 
                bg-linear-to-r from-muted-foreground via-foreground to-muted-foreground
                bg-size-[200%_auto] 
                animate-shimmer"
                speed={0.02}
                delay={0.5}
              />

              <footer className="text-sm text-muted-foreground">
                {t("team")}
              </footer>
            </blockquote>
          </div>
        </div>

        <div className="lg:p-8 h-full flex items-center relative overflow-hidden">
          <div
            className="absolute inset-0 h-full w-full bg-background 
            bg-[radial-gradient(#a1a1aa_1px,transparent_1px)] 
            dark:bg-[radial-gradient(#52525b_1px,transparent_1px)] 
            bg-size-[20px_20px]
            opacity-100 
            pointer-events-none -z-20"
          />

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--background)_30%,transparent_100%)] pointer-events-none -z-10" />
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] z-10 relative">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {t("welcome")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("instruction")}
              </p>
            </div>

            <UserAuthForm />

            <p className="px-8 text-center text-sm text-muted-foreground text-balance">
              {t.rich("agreement", {
                block: (chunks) => <span className="block mt-1">{chunks}</span>,
                terms: (chunks) => (
                  <Link
                    href="/terms"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    {chunks}
                  </Link>
                ),
                privacy: (chunks) => (
                  <Link
                    href="/privacy"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
