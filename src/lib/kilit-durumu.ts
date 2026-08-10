/** Müşteri talep formu — kilit/anahtar durumu (yalnız sorunTipi=kilit) */

export const KILIT_DURUMLARI = [
  {
    id: "iceride",
    etiket: "Anahtar içeride kaldı, kapılar kilitli",
  },
  {
    id: "kayip",
    etiket: "Anahtar kayboldu / yok",
  },
  {
    id: "kirik",
    etiket: "Anahtar kırıldı / büküldü",
  },
  {
    id: "kumanda",
    etiket: "Kumanda / uzaktan kilit çalışmıyor",
  },
  {
    id: "kontak",
    etiket: "Kontak / immobilizer açılmıyor",
  },
  {
    id: "diger",
    etiket: "Diğer anahtar / kilit sorunu",
  },
] as const;

export type KilitDurumuId = (typeof KILIT_DURUMLARI)[number]["id"];

export function kilitDurumuEtiket(id: string): string | null {
  return KILIT_DURUMLARI.find((d) => d.id === id)?.etiket ?? null;
}

export function kilitDurumuGecerliMi(id: string): boolean {
  return KILIT_DURUMLARI.some((d) => d.id === id);
}

/** Talep kaydı veya sorun metninden kilit durumu etiketi */
export function talepKilitDurumuEtiket(opts: {
  kilitDurumu?: string;
  sorun?: string;
}): string | null {
  const id = opts.kilitDurumu?.trim() ?? "";
  if (kilitDurumuGecerliMi(id)) return kilitDurumuEtiket(id);
  const sorun = opts.sorun ?? "";
  for (const d of KILIT_DURUMLARI) {
    if (sorun.includes(d.etiket)) return d.etiket;
  }
  return null;
}
