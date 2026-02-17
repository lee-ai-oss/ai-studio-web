import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 로그인/정적/이미지/API 일부는 예외
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // 쿠키 없으면 로그인으로
  const session = req.cookies.get("as_session")?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 어떤 경로에 적용할지
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
