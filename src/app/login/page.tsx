"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onLogin() {
    setErr("");
    setLoading(true);
    try {
      await apiPost("/api/auth-check", {}, pw);
      setToken(pw);
      router.replace("/");
    } catch (e: any) {
      setErr(e?.message || "로그인 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm border rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-bold">AI 통합 스튜디오</h1>
        <p className="text-sm text-gray-500">패스코드를 입력하세요</p>

        <input
          className="w-full border rounded-lg px-3 py-2"
          type="password"
          placeholder="APP_PASSWORD"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />

        {err ? <div className="text-sm text-red-600">{err}</div> : null}

        <button
          className="w-full rounded-lg bg-black text-white py-2 disabled:opacity-50"
          onClick={onLogin}
          disabled={!pw || loading}
        >
          {loading ? "확인 중..." : "로그인"}
        </button>
      </div>
    </main>
  );
}
