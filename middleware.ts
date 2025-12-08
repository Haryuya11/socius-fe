import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  // Kiểm tra xem user có muốn đổi ngôn ngữ không (có query param ?lang=...)
  const langParam = nextUrl.searchParams.get("lang");

  if (langParam && ["vi", "en-US"].includes(langParam)) {
    // 1. Tạo response redirect về chính trang hiện tại nhưng bỏ param ?lang= đi
    const response = NextResponse.redirect(
      new URL(nextUrl.pathname, request.url)
    );

    // 2. Lưu ngôn ngữ vào Cookie (1 năm)
    response.cookies.set("NEXT_LOCALE", langParam, {
      path: "/",
      maxAge: 31536000,
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
