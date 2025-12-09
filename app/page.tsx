/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { authUtils, UserInfo } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react"; 
import { toast } from "sonner"; 

export default function HomePage() {
  const { instance } = useMsal();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userInfo = authUtils.getUserInfo();
    if (userInfo) {
      setUser(userInfo);
    }
  }, []);

  const handleLogout = () => {
    authUtils.clearAuth();
    const currentOrigin = window.location.origin;
    const loginPage = "/login";

    instance.logoutRedirect({
      postLogoutRedirectUri: `${currentOrigin}${loginPage}`,
    });
  };

  // 4. Hàm xử lý copy token
  const handleCopyToken = () => {
    const token = authUtils.getToken();
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      toast.success("Đã copy token vào clipboard!");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } else {
      toast.error("Không tìm thấy token!");
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-muted/20">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>

        {user ? (
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm animate-in fade-in zoom-in duration-300">
            <div className="space-y-4 text-left min-w-[300px]">
              {/* Thông tin User */}
              <div className="space-y-2">
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="font-semibold text-muted-foreground">
                    Tên:
                  </span>
                  <span className="font-medium truncate">{user.name}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="font-semibold text-muted-foreground">
                    Email:
                  </span>
                  <span className="font-medium truncate">{user.email}</span>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="font-semibold text-muted-foreground">
                    ID:
                  </span>
                  <span className="font-medium text-xs text-muted-foreground truncate font-mono bg-muted p-1 rounded">
                    {user.id}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-muted-foreground text-sm">
                    Access Token:
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted p-2 rounded text-xs text-muted-foreground font-mono truncate max-w-[250px]">
                      {authUtils.getToken()}
                    </code>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={handleCopyToken}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="sr-only">Copy Token</span>
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    *Token này dùng để test API trên Postman/Swagger
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Đang tải thông tin...</p>
        )}
      </div>

      <Button variant="destructive" size="lg" onClick={handleLogout}>
        Đăng xuất
      </Button>
    </div>
  );
}
