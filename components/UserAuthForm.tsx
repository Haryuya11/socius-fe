/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useMsal } from "@azure/msal-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authUtils, UserInfo } from "@/lib/auth-helpers";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const { instance } = useMsal();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const router = useRouter();
  const t = useTranslations("Auth");

  const login = async () => {
    setIsLoading(true);
    try {
      const res = await instance.loginPopup({
        scopes: ["openid", "profile", "email"],
      });

      if (res.account && res.idToken) {

        const tokenExpiresAt = new Date((res.idTokenClaims as any).exp * 1000);

        const userInfo: UserInfo = {
          id: res.account.localAccountId || res.uniqueId,
          name: res.account.name || "User",
          email: res.account.username,
          username: res.account.username,
        };

        authUtils.setAuth(
          res.idToken,
          res.accessToken,
          userInfo,
          tokenExpiresAt
        );
        console.log("Session will expire at:", tokenExpiresAt.toLocaleString());
      }

      console.log(res);
      toast.success(t("login_success", { name: res.account?.name || "User" }));

      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error(t("login_failed"));
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
        onClick={login}
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
