import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { istanbulGunSonunaKalanSn } from "./istanbul-tarih";
import { telefonDogrulandiMi } from "./musteri-otp";
import { telefonNormalize } from "./telefon";

export const MUSTERI_TEL_COOKIE = "musteri_tel_dogrulandi";

/** Çerez + sunucudaki OTP kaydı birlikte geçerli olmalı (aynı gün) */
export async function getDogrulanmisTelefon(): Promise<string | null> {
  const store = await cookies();
  const val = store.get(MUSTERI_TEL_COOKIE)?.value;
  if (!val) return null;
  const norm = telefonNormalize(val);
  if (!/^05[0-9]{9}$/.test(norm)) return null;
  if (!(await telefonDogrulandiMi(norm))) return null;
  return norm;
}

export function musteriTelCookieTemizle(response: {
  cookies: { delete: (name: string) => void };
}): void {
  response.cookies.delete(MUSTERI_TEL_COOKIE);
}

export function musteriTelCookieDegeri(telefon: string): string {
  return telefonNormalize(telefon);
}

export function musteriTelCookieAyarla(
  response: NextResponse,
  telefon: string
): void {
  response.cookies.set(MUSTERI_TEL_COOKIE, musteriTelCookieDegeri(telefon), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: istanbulGunSonunaKalanSn(),
    path: "/",
  });
}
