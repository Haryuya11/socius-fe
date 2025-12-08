import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Socius",
  description: "Đăng nhập vào hệ thống quản lý Socius",
};

export default function AuthenticationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
