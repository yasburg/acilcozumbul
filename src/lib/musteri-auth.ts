import { cookies } from "next/headers";
import { telefonNormalize } from "./telefon";

export const MUSTERI_TEL_COOKIE = "musteri_tel_dogrulandi";

export async function getDogrulanmisTelefon(): Promise<string | null> {
  const store = await cookies();
  const val = store.get(MUSTERI_TEL_COOKIE)?.value;
  if (!val) return null;
  const norm = telefonNormalize(val);
  return /^05[0-9]{9}$/.test(norm) ? norm : null;
}

export function musteriTelCookieDegeri(telefon: string): string {
  return telefonNormalize(telefon);
}
