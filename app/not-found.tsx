"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileQuestion, MoveLeft, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground animate-in fade-in zoom-in duration-500">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 text-center md:px-6">
        {/* Icon trang trí */}
        <div className="rounded-full bg-muted p-6">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>

        {/* Tiêu đề & Nội dung */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            404
          </h1>
          <h2 className="text-2xl font-semibold tracking-tight">
            Trang không tìm thấy
          </h2>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm. Có
            thể trang đã bị xóa hoặc đường dẫn không chính xác.
          </p>
        </div>

        {/* Nút điều hướng */}
        <div className="flex flex-col gap-2 min-[400px]:flex-row">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <MoveLeft className="h-4 w-4" />
            Quay lại
          </Button>

          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Về trang chủ
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer nhỏ (Optional) */}
      <div className="absolute bottom-8 text-xs text-muted-foreground">
        Hệ thống Socius Web
      </div>
    </div>
  );
}
