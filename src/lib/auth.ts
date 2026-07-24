import { cookies } from "next/headers";
import { getCekiciByToken } from "./db";
import type { Cekici } from "./types";
import { CEKICI_COOKIE } from "./auth-cookie";

export { CEKICI_COOKIE } from "./auth-cookie";

/**
 * Kalıcı oturum süresi. Chrome/Chromium kalıcı çerezleri ~400 gün ile sınırlar;
 * daha uzun maxAge yine de bu tavana iner.
 */
export const CEKICI_OTURUM_MAX_AGE_ANIMSA = 60 * 60 * 24 * 400;

export function cekiciOturumCookieAyarlari(beniAnimsa = true): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge?: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(beniAnimsa ? { maxAge: CEKICI_OTURUM_MAX_AGE_ANIMSA } : {}),
  };
}

/** İstek gövdesinden «beni anımsa»; tanımsızsa varsayılan true */
export function beniAnimsaOku(deger: unknown): boolean {
  if (deger === false || deger === "false" || deger === 0 || deger === "0") {
    return false;
  }
  return true;
}

export async function getCurrentCekici(): Promise<Cekici | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CEKICI_COOKIE)?.value;
  if (!token) return null;
  const cekici = await getCekiciByToken(token);
  return cekici ?? null;
}
