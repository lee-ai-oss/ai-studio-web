import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const localPw = process.env.APP_PASSWORD_LOCAL || "";
  const auth = req.headers.get("authorization") || "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";

  if (!localPw) {
    return NextResponse.json(
      { ok: false, error: { message: "APP_PASSWORD_LOCAL is not set in .env.local" } },
      { status: 500 }
    );
  }

  if (!token || token !== localPw) {
    return NextResponse.json(
      { ok: false, error: { message: "Invalid password (local mode)" } },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true, user: "owner-local" }, { status: 200 });
}
