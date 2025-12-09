import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPages = [
  "/login",
  "/terms",
  "/privacy",
  "/examples/authentication",
];

export function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // Get ID Token (Session)
  const token = request.cookies.get("session_token")?.value;

  // Check if the user wants to change the language (has query param ?lang=...)
  const langParam = nextUrl.searchParams.get("lang");

  if (langParam && ["vi", "en-US"].includes(langParam)) {
    // 1. Create a response redirect to the current page but remove the ?lang= param
    const response = NextResponse.redirect(
      new URL(nextUrl.pathname, request.url)
    );
    // 2. Save language to Cookie (1 year)
    response.cookies.set("NEXT_LOCALE", langParam, {
      path: "/",
      maxAge: 31536000,
    });
    return response;
  }

  // Check if the current page is in the public pages list
  const isPublicPage = publicPages.some((page) =>
    nextUrl.pathname.startsWith(page)
  );

  // If the page is not public and there is no token, redirect to /login
  if (!token && !isPublicPage)
    return NextResponse.redirect(new URL("/login", request.url));

  // If the page is public and there is a token, redirect to /
  if (token)
    if (isPublicPage && nextUrl.pathname === "/login")
      return NextResponse.redirect(new URL("/", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
