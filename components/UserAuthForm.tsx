"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons"; // Đảm bảo đường dẫn icon đúng
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/use-auth";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const router = useRouter();
  const t = useTranslations("Auth");

  const handleLogin = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await login();
      router.push("/dashboard");
    } catch (err) {
      console.error("Login trigger error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={handleLogin}
        className="h-12 w-full font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-accent/50 hover:text-accent-foreground active:scale-[0.98]"
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.microsoft className="mr-2 h-4 w-4" />
        )}
        {t("login_with_microsoft")}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("system_name")}
          </span>
        </div>
      </div>
    </div>
  );
}
