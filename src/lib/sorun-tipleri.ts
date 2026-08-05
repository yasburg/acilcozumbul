export interface SorunTipi {
  id: string;
  label: string;
  icon: string;
}

/** SMS / hizmet filtresi için geçerli sorun tipi kimlikleri */
export const TUM_SORUN_TIP_IDLERI = [
  "cekici",
  "ariza",
  "lastik",
  "aku",
  "yakit",
  "kaza",
  "kilit",
  "diger",
] as const;

export type SorunTipiId = (typeof TUM_SORUN_TIP_IDLERI)[number];

export const SORUN_TIPLERI: SorunTipi[] = [
  { id: "cekici", label: "Çekici / kurtarma lazım", icon: "🚛" },
  { id: "ariza", label: "Araç arızası / çalışmıyor", icon: "⚠️" },
  { id: "lastik", label: "Lastik patladı", icon: "🛞" },
  { id: "aku", label: "Akü bitti", icon: "🔋" },
  { id: "yakit", label: "Yakıt bitti", icon: "⛽" },
  { id: "kaza", label: "Kaza / çarpışma", icon: "💥" },
  { id: "kilit", label: "Araç kilitlendi / Anahtar çalışmıyor", icon: "🔑" },
  { id: "diger", label: "Diğer", icon: "✏️" },
];

export function sorunTipiBul(id: string): SorunTipi | undefined {
  return SORUN_TIPLERI.find((s) => s.id === id);
}

export function gecerliSorunTipi(id: string): id is SorunTipiId {
  return (TUM_SORUN_TIP_IDLERI as readonly string[]).includes(id);
}

/**
 * Landing / Ads URL `?hizmet=` veya `?sorun=` → sorun tipi.
 * Örn. ?sorun=cekici · ?hizmet=anahtar → kilit
 */
export const HIZMET_QUERY_HARITASI: Record<string, SorunTipiId> = {
  cekici: "cekici",
  lastik: "lastik",
  aku: "aku",
  anahtar: "kilit",
  kilit: "kilit",
  ariza: "ariza",
  kaza: "kaza",
  yakit: "yakit",
  diger: "diger",
};

export function hizmetQuerydenSorunTipi(
  raw: string | null | undefined
): SorunTipiId | null {
  const key = raw?.trim().toLowerCase();
  if (!key) return null;
  if (HIZMET_QUERY_HARITASI[key]) return HIZMET_QUERY_HARITASI[key];
  return gecerliSorunTipi(key) ? key : null;
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

/** Talep gönderme CTA — teklif iste (çağır değil) */
export const UCRETSIZ_TEKLIF_CTA = "Ücretsiz teklif iste";

export function sorunCagriButonEtiketi(_sorunTipi?: string): string {
  return UCRETSIZ_TEKLIF_CTA;
}

/** Fotoğraf istenen sorun tipleri (çekici / arıza / kaza / diğer) */
export const SORUN_FOTOGRAF_TIPLERI: SorunTipiId[] = [
  "ariza",
  "lastik",
  "kaza",
  "cekici",
  "diger",
];

/** Çekici / kurtarma — araç modeli alanı gösterilen tipler (opsiyonel) */
export const SORUN_ARAC_MODELI_TIPLERI: SorunTipiId[] = ["ariza", "kaza", "cekici"];

/** Yerinde müdahale — hedef (çekilecek) adres adımı yok */
export const SORUN_HEDEF_KONUM_ATLANIR: SorunTipiId[] = [
  "lastik",
  "aku",
  "yakit",
  "kilit",
];

export function sorunHedefKonumGerekliMi(sorunTipi?: string): boolean {
  const id = talepSorunTipi({ sorunTipi: sorunTipi });
  return !SORUN_HEDEF_KONUM_ATLANIR.includes(id);
}

/** Hedef «bilmiyorum» seçilince müşteriye gösterilen sürelere eklenen dk */
export const HEDEF_BILINMIYOR_EK_SURE_DK = 30;

/**
 * Müşteri teklif kartı: yanına varış vs çekilecek yere gidiş.
 * Çekici tek `tahminiSureDk` girer; rota paneli çoğu zaman toplamı yazar.
 * Hedef süresi biliniyorsa ve tahmini > çekme ise tahmini toplam kabul edilir.
 */
export function musteriTeklifSureKirilim(opts: {
  tahminiSureDk: number;
  hedefGerekli: boolean;
  hedefBilinmiyor?: boolean;
  /** Müşteri → hedef sürüş dk (hesaplandıysa) */
  cekmeSureDk?: number | null;
}): { gelisDk: number; cekmeDk: number | null } {
  const tahmini = Math.max(1, Math.round(opts.tahminiSureDk) || 1);
  if (!opts.hedefGerekli) {
    return { gelisDk: tahmini, cekmeDk: null };
  }
  if (opts.hedefBilinmiyor) {
    return { gelisDk: tahmini, cekmeDk: HEDEF_BILINMIYOR_EK_SURE_DK };
  }
  const cekme =
    opts.cekmeSureDk != null && opts.cekmeSureDk > 0
      ? Math.max(1, Math.round(opts.cekmeSureDk))
      : null;
  if (cekme == null) {
    return { gelisDk: tahmini, cekmeDk: null };
  }
  if (tahmini > cekme) {
    return { gelisDk: tahmini - cekme, cekmeDk: cekme };
  }
  return { gelisDk: tahmini, cekmeDk: cekme };
}

/** @deprecated Tercihen musteriTeklifSureKirilim — tek sayıya birleşik süre */
export function musteriGosterimSureDk(
  tahminiSureDk: number,
  hedefBilinmiyor?: boolean
): number {
  return (
    tahminiSureDk +
    (hedefBilinmiyor ? HEDEF_BILINMIYOR_EK_SURE_DK : 0)
  );
}

/** Konum adımında fotoğraf alanı göster (isteğe bağlı) */
export function sorunFotografAlaniGoster(sorunTipi?: string): boolean {
  if (!sorunTipi?.trim()) return false;
  const id = talepSorunTipi({ sorunTipi: sorunTipi });
  return (
    SORUN_FOTOGRAF_TIPLERI.includes(id) ||
    SORUN_ARAC_MODELI_TIPLERI.includes(id)
  );
}

/** Fotoğraf artık zorunlu değil; alan isteğe bağlı gösterilir */
export function sorunFotografGerekliMi(_sorunTipi?: string): boolean {
  return false;
}

/** Araç modeli artık zorunlu değil; alan isteğe bağlı gösterilir */
export function sorunAracModeliGerekliMi(_sorunTipi?: string): boolean {
  return false;
}

export function sorunAracModeliAlaniGoster(sorunTipi?: string): boolean {
  if (!sorunTipi?.trim()) return false;
  const id = talepSorunTipi({ sorunTipi: sorunTipi });
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
