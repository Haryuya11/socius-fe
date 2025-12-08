"use client";

import * as React from "react";
import { useMsal } from "@azure/msal-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { useRouter } from "next/navigation";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const { instance } = useMsal();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const router = useRouter();

  const login = async () => {
    setIsLoading(true);
    try {
      const res = await instance.loginPopup({
        scopes: ["openid", "profile", "email"],
      });

      console.log("Login success:", res);
      toast.success(`Chào mừng trở lại, ${res.account?.name || "User"}!`);

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
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
        className="h-12 w-full font-medium"
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.microsoft className="mr-2 h-4 w-4" />
        )}
        Đăng nhập với Microsoft
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Hệ thống Socius Web
          </span>
        </div>
      </div>
    </div>
  );
}
