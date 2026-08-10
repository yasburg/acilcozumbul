/** Müşteri talep formu — yakıt tipi (yalnız sorunTipi=yakit) */

export const YAKIT_TIPLERI = [
  { id: "benzin", etiket: "Benzin" },
  { id: "dizel", etiket: "Dizel / mazot" },
  { id: "lpg", etiket: "LPG" },
  { id: "elektrik", etiket: "Elektrik (şarj)" },
] as const;

export type YakitTipiId = (typeof YAKIT_TIPLERI)[number]["id"];

export function yakitTipiEtiket(id: string): string | null {
  return YAKIT_TIPLERI.find((d) => d.id === id)?.etiket ?? null;
}

export function yakitTipiGecerliMi(id: string): boolean {
  return YAKIT_TIPLERI.some((d) => d.id === id);
}

/** Talep kaydı veya sorun metninden yakıt tipi etiketi */
export function talepYakitTipiEtiket(opts: {
  yakitTipi?: string;
  sorun?: string;
}): string | null {
  const id = opts.yakitTipi?.trim() ?? "";
  if (yakitTipiGecerliMi(id)) return yakitTipiEtiket(id);
  const sorun = opts.sorun ?? "";
  for (const d of YAKIT_TIPLERI) {
    if (sorun.includes(d.etiket)) return d.etiket;
  }
  return null;
}
