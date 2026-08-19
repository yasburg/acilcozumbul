import { trendyolEfaturamAccessTokenAl } from "./auth";
import { trendyolEfaturamConfigOku } from "./config";

export async function efaturamApiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const { apiBaseUrl } = trendyolEfaturamConfigOku();
  const accessToken = await trendyolEfaturamAccessTokenAl();
  const headers = new Headers(init.headers);
  headers.set("x-access-token", accessToken);
  headers.set("Authorization", `Bearer ${accessToken}`);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  return fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });
}

export async function efaturamApiJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await efaturamApiFetch(path, init);
  const text = await res.text();
  if (!res.ok) {
    const auth401 = res.status === 401;
    throw new Error(
      auth401
        ? `Trendyol E-Faturam ${path} (401): Oturum reddedildi. Bearer token ve IP whitelist kontrol edin; stage/prod gateway, şifre ve companyId/userId aynı ortamda olmalı. Yanıt: ${text.slice(0, 200)}`
        : `Trendyol E-Faturam ${path} (${res.status})${text ? `: ${text.slice(0, 300)}` : ""}`
    );
  }
  if (!text.trim()) return {} as T;
  return JSON.parse(text) as T;
}
