export interface SorunTipi {
  id: string;
  label: string;
  icon: string;
}

/** SMS / hizmet filtresi için geçerli sorun tipi kimlikleri */
export const TUM_SORUN_TIP_IDLERI = [
  "ariza",
  "lastik",
  "aku",
  "yakit",
  "kaza",
  "kilit",
  "cekici",
  "diger",
] as const;

export type SorunTipiId = (typeof TUM_SORUN_TIP_IDLERI)[number];

export const SORUN_TIPLERI: SorunTipi[] = [
  { id: "ariza", label: "Araç arızası / çalışmıyor", icon: "⚠️" },
  { id: "lastik", label: "Lastik patladı", icon: "🛞" },
  { id: "aku", label: "Akü bitti", icon: "🔋" },
  { id: "yakit", label: "Yakıt bitti", icon: "⛽" },
  { id: "kaza", label: "Kaza / çarpışma", icon: "💥" },
  { id: "kilit", label: "Arabam kilitlendi / Anahtar çalışmıyor", icon: "🔑" },
  { id: "cekici", label: "Çekici / kurtarma lazım", icon: "🚛" },
  { id: "diger", label: "Diğer", icon: "✏️" },
];

export function sorunTipiBul(id: string): SorunTipi | undefined {
  return SORUN_TIPLERI.find((s) => s.id === id);
}

export function gecerliSorunTipi(id: string): id is SorunTipiId {
  return (TUM_SORUN_TIP_IDLERI as readonly string[]).includes(id);
}

export function tumSorunTipIdleri(): SorunTipiId[] {
  return [...TUM_SORUN_TIP_IDLERI];
}

/** Talep kaydındaki sorun tipi (yoksa diğer) */
export function talepSorunTipi(talep: { sorunTipi?: string }): SorunTipiId {
  const id = talep.sorunTipi?.trim();
  if (id && gecerliSorunTipi(id)) return id;
  return "diger";
}

/** Son adım (hedef) «çağır» butonu metni */
const SORUN_CAGRI_BUTON: Record<SorunTipiId, string> = {
  ariza: "Çekici çağır",
  lastik: "Lastikçi çağır",
  aku: "Yol yardım çağır",
  yakit: "Yol yardım çağır",
  kaza: "Çekici çağır",
  kilit: "Anahtarcı çağır",
  cekici: "Çekici çağır",
  diger: "Yol yardım çağır",
};

export function sorunCagriButonEtiketi(sorunTipi?: string): string {
  const id = talepSorunTipi({ sorunTipi });
  const tip = sorunTipiBul(id);
  const metin = SORUN_CAGRI_BUTON[id];
  return `${tip?.icon ?? "🚛"} ${metin}`;
}

/** Fotoğraf istenen sorun tipleri (çekici / arıza / kaza vb.) */
export const SORUN_FOTOGRAF_TIPLERI: SorunTipiId[] = [
  "ariza",
  "lastik",
  "kaza",
  "cekici",
];

/** Çekici / kurtarma — araç modeli istenen tipler */
export const SORUN_ARAC_MODELI_TIPLERI: SorunTipiId[] = ["ariza", "kaza", "cekici"];

/** Konum adımında fotoğraf alanı göster (zorunlu veya isteğe bağlı) */
export function sorunFotografAlaniGoster(sorunTipi?: string): boolean {
  if (!sorunTipi?.trim()) return false;
  const id = talepSorunTipi({ sorunTipi });
  return (
    SORUN_FOTOGRAF_TIPLERI.includes(id) ||
    SORUN_ARAC_MODELI_TIPLERI.includes(id)
  );
}

export function sorunFotografGerekliMi(sorunTipi?: string): boolean {
  const id = talepSorunTipi({ sorunTipi });
  return SORUN_FOTOGRAF_TIPLERI.includes(id);
}

export function sorunAracModeliGerekliMi(sorunTipi?: string): boolean {
  const id = talepSorunTipi({ sorunTipi });
  return SORUN_ARAC_MODELI_TIPLERI.includes(id);
}

export function sorunMetniOlustur(sorunTipi: string, sorunDetay?: string): string {
  const tip = sorunTipiBul(sorunTipi);
  const baslik = tip?.label ?? sorunTipi;
  if (sorunTipi === "diger" && sorunDetay?.trim()) {
    return sorunDetay.trim();
  }
  if (sorunDetay?.trim()) {
    return `${baslik}: ${sorunDetay.trim()}`;
  }
  return baslik;
}
