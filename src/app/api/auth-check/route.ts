import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

// 서명된 세션 토큰 생성/검증(서버 저장소 없이 가능)
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
  const authHeader = req.headers.get("authorization") || "";
  const inputPassword = authHeader.replace("Bearer ", "");

  const correctPassword = process.env.APP_PASSWORD_LOCAL;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!correctPassword || !sessionSecret) {
    return NextResponse.json({ message: "서버 설정 오류" }, { status: 500 });
  }

  // 타이밍 안전 비교
  if (!timingSafeEq(inputPassword, correctPassword)) {
    return NextResponse.json({ message: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  // 세션 토큰(만료 포함) 발급: payload.signature
  const expiresInSec = 60 * 60 * 24 * 7; // 7일
  const exp = Math.floor(Date.now() / 1000) + expiresInSec;
  const nonce = crypto.randomUUID();
  const payloadObj = { exp, nonce };
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString("base64url");
  const sig = sign(payload, sessionSecret);
  const token = `${payload}.${sig}`;

  const res = NextResponse.json({ ok: true });

  // httpOnly 쿠키(자바스크립트에서 읽기 불가)
  res.cookies.set({
    name: "as_session",
    value: token,
    httpOnly: true,
    secure: true,        // Netlify는 HTTPS라 OK (로컬에서 테스트하려면 아래 참고)
    sameSite: "lax",
    path: "/",
    maxAge: expiresInSec,
  });

  return res;
}

export async function GET(req: Request) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return NextResponse.json({ message: "서버 설정 오류" }, { status: 500 });
  }

  const cookie = req.headers.get("cookie") || "";
  const token = cookie.split("as_session=")[1]?.split(";")[0];

  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const [payload, sig] = token.split(".");
  if (!payload || !sig) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const expected = sign(payload, sessionSecret);
  if (!timingSafeEq(sig, expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const obj = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  const now = Math.floor(Date.now() / 1000);
  if (!obj?.exp || obj.exp < now) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}

