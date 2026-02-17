import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 로그인/인증 API/정적 파일은 예외
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    const res = NextResponse.next();

    // ⭐ 쿠키 보이는지 확인용 헤더 추가
    res.headers.set(
      "x-as-session",
      req.cookies.get("as_session") ? "1" : "0"
    );
    res.headers.set("x-path", pathname);

    return res;
  }

  const session = req.cookies.get("as_session")?.value;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";

    const res = NextResponse.redirect(url);

    // ⭐ 쿠키 없을 때도 헤더 표시
    res.headers.set("x-as-session", "0");
    res.headers.set("x-path", pathname);

    return res;
  }

  const res = NextResponse.next();

  // ⭐ 쿠키 있을 때 표시
  res.headers.set("x-as-session", "1");
  res.headers.set("x-path", pathname);

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
