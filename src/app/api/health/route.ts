import { NextResponse } from "next/server";

export const runtime = "nodejs";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function GET() {
  const API_BASE = mustEnv("NEXT_PUBLIC_API_BASE");
  const upstream = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
