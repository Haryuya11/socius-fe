import { Metadata } from "next";
import Link from "next/link";
import { UserAuthForm } from "@/components/UserAuthForm";
import SociusLogo from "@/components/SociusLogo";
import { ThemeToggle } from "@/components/ThemeToggle"; // Nhớ import component này

export const metadata: Metadata = {
  title: "Đăng nhập | Socius",
  description: "Đăng nhập vào hệ thống quản lý Socius",
};

export default function AuthenticationPage() {
  return (
    <>
      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="absolute right-4 top-4 md:right-8 md:top-8 flex items-center gap-4">
          <Link
            href="/examples/authentication"
            className="text-sm font-medium hover:underline text-muted-foreground"
          >
            Trợ giúp?
          </Link>
          <ThemeToggle />
        </div>

        <div className="relative hidden h-full flex-col bg-muted p-10 text-muted-foreground lg:flex dark:border-r">
          <div className="relative z-20 flex items-center text-lg font-medium gap-2">
            <SociusLogo className="h-10 w-auto text-primary fill-current" />
          </div>

          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg text-foreground">
                &ldquo;Kết nối con người, quản lý nhân sự hiệu quả và xây dựng
                cộng đồng vững mạnh cùng Socius.&rdquo;
              </p>
              <footer className="text-sm">Socius Team</footer>
            </blockquote>
          </div>
        </div>

        {/* Cột bên phải: Form Login */}
        <div className="lg:p-8 bg-background">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Chào mừng trở lại
              </h1>
              <p className="text-sm text-muted-foreground">
                Vui lòng đăng nhập bằng tài khoản tổ chức của bạn để tiếp tục.
              </p>
            </div>

            <UserAuthForm />

            <p className="px-8 text-center text-sm text-muted-foreground">
              Bằng cách tiếp tục, bạn đồng ý với{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Chính sách bảo mật
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
