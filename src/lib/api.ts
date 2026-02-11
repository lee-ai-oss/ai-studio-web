const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function apiGet(path: string, token?: string) {
  const res = await fetch(path.startsWith("/api/") ? path : `${API_BASE}${path}`, {
    method: "GET",
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
  return data;
}


function resolveUrl(path: string) {
  // 로컬 Next.js API 라우트는 상대경로로 호출
  if (path.startsWith("/api/")) return path;
  // 그 외는 Worker 베이스로
  return `${API_BASE}${path}`;
}

export async function apiPost(path: string, body: unknown, token?: string) {
  const res = await fetch(resolveUrl(path), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
    credentials: "include",
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
  return data;
}

