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

export async function GET(req: Request) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) return NextResponse.json({ ok: false }, { status: 500 });

  const cookie = req.headers.get("cookie") || "";
  const token = cookie.split("as_session=")[1]?.split(";")[0];
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return NextResponse.json({ ok: false }, { status: 401 });

  const expected = sign(payload, sessionSecret);
  if (!timingSafeEq(sig, expected)) return NextResponse.json({ ok: false }, { status: 401 });

  const obj = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  const now = Math.floor(Date.now() / 1000);
  if (!obj?.exp || obj.exp < now) return NextResponse.json({ ok: false }, { status: 401 });

  return NextResponse.json({ ok: true });
}
