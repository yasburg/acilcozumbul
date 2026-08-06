import { telefonGecerliMi, telefonNormalize } from "@/lib/telefon";
import type { Talep } from "@/lib/types";

/** Talep üzerinde müşteri iletişim bilgisi tamam mı (teklif seçimi öncesi). */
export function talepIletisimTamMi(
  talep: Pick<Talep, "ad" | "soyad" | "telefon">
): boolean {
  return (
    telefonGecerliMi(talep.telefon) &&
    Boolean(talep.ad?.trim()) &&
    Boolean(talep.soyad?.trim())
  );
}

export function talepTelefonNorm(telefon: string | null | undefined): string | null {
  if (!telefon?.trim()) return null;
  const n = telefonNormalize(telefon);
  return telefonGecerliMi(n) ? n : null;
}
