export const AUTH_KEY = "ai_studio_token";

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(AUTH_KEY) || "";
}

export function setToken(token: string) {
  localStorage.setItem(AUTH_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(AUTH_KEY);
}
