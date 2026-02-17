import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

function sign(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}
function timingSafeEq(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({} as any));

  const correctPassword = process.env.APP_PASSWORD_LOCAL;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!correctPassword || !sessionSecret) {
    return NextResponse.json({ message: "서버 설정 오류" }, { status: 500 });
  }

  if (typeof password !== "string" || !timingSafeEq(password, correctPassword)) {
    return NextResponse.json({ message: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const expiresInSec = 60 * 60 * 24 * 7;
  const exp = Math.floor(Date.now() / 1000) + expiresInSec;
  const nonce = crypto.randomUUID();
  const payload = Buffer.from(JSON.stringify({ exp, nonce })).toString("base64url");
  const sig = sign(payload, sessionSecret);
  const token = `${payload}.${sig}`;

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "as_session",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: expiresInSec,
  });

  return res;
}
