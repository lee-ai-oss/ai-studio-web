"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/auth";
import { useEffect } from "react";

const items = [
  { href: "/", label: "대시보드" },
  { href: "/image", label: "AI 이미지 생성 (Step 3)" },
  { href: "/research", label: "유튜브 소재 찾기 (Step 4)", disabled: true },
  { href: "/assets", label: "이미지 에셋 관리 (Step 5)", disabled: true },
  { href: "/video", label: "AI 영상 생성 (Step 6)", disabled: true },
  { href: "/pipeline", label: "자동화 파이프라인 (Step 11)", disabled: true },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const t = getToken();
    if (!t) router.replace("/login");
  }, [router]);

  function logout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      <aside className="border-r p-4 space-y-4">
        <div>
          <div className="font-bold">AI 통합 스튜디오</div>
          <div className="text-xs text-gray-500">Local mode</div>
        </div>

        <nav className="space-y-1">
          {items.map((it) => {
            const active = pathname === it.href;
            const cls = [
              "block rounded-lg px-3 py-2 text-sm",
              active ? "bg-black text-white" : "hover:bg-gray-100",
              it.disabled ? "opacity-40 pointer-events-none" : "",
            ].join(" ");

            return (
              <Link key={it.href} href={it.href} className={cls}>
                {it.label}
              </Link>
            );
          })}
        </nav>

        <button className="text-sm underline" onClick={logout}>
          로그아웃
        </button>
      </aside>

      <main className="p-6">{children}</main>
    </div>
  );
}
