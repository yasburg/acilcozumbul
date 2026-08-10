/** Müşteri talep formu — lastik durumu (yalnız sorunTipi=lastik) */

export const LASTIK_DURUMLARI = [
  {
    id: "yama",
    etiket: "Lastik yama lazım / söndü",
  },
  {
    id: "degisim",
    etiket: "Lastik yarıldı (değişim istiyorum)",
  },
] as const;

export type LastikDurumuId = (typeof LASTIK_DURUMLARI)[number]["id"];

export function lastikDurumuEtiket(id: string): string | null {
  return LASTIK_DURUMLARI.find((d) => d.id === id)?.etiket ?? null;
}

export function lastikDurumuGecerliMi(id: string): boolean {
  return LASTIK_DURUMLARI.some((d) => d.id === id);
}

export const LASTIK_DURUMU_BILGI =
  "Yama yeterli değilse lastikçiler ek ücret talep edebilir.";

/** Talep kaydı veya sorun metninden lastik durumu etiketi */
export function talepLastikDurumuEtiket(opts: {
  lastikDurumu?: string;
  sorun?: string;
}): string | null {
  const id = opts.lastikDurumu?.trim() ?? "";
  if (lastikDurumuGecerliMi(id)) return lastikDurumuEtiket(id);
  const sorun = opts.sorun ?? "";
  for (const d of LASTIK_DURUMLARI) {
    if (sorun.includes(d.etiket)) return d.etiket;
  }
  return null;
}
