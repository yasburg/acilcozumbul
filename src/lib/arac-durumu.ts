/** Müşteri talep formu — aracın hareket durumu */

export const ARAC_DURUMLARI = [
  {
    id: "calisiyor",
    etiket: "Araç çalışıyor",
  },
  {
    id: "calismiyor_bosa_aliniyor",
    etiket: "Araç çalışmıyor, ama boşa alınıyor",
  },
  {
    id: "calismiyor_bosa_alinamiyor",
    etiket: "Araç çalışmıyor, boşa alınamıyor",
  },
] as const;

export type AracDurumuId = (typeof ARAC_DURUMLARI)[number]["id"];

export function aracDurumuEtiket(id: string): string | null {
  return ARAC_DURUMLARI.find((d) => d.id === id)?.etiket ?? null;
}

export function aracDurumuGecerliMi(id: string): boolean {
  return ARAC_DURUMLARI.some((d) => d.id === id);
}
