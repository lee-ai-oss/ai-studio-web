import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const inputPassword = authHeader.replace("Bearer ", "");

  const correctPassword = process.env.APP_PASSWORD_LOCAL;

  if (!correctPassword) {
    return NextResponse.json(
      { message: "서버 설정 오류" },
      { status: 500 }
    );
  }

  if (inputPassword !== correctPassword) {
    return NextResponse.json(
      { message: "비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
