export interface SorunTipi {
  id: string;
  label: string;
  /** Legacy icon key — render via `SorunIkon` / `SORUN_ICON_MAP` (Hugeicons) */
  icon: string;
  /** Kısa etiket (grid / progressive flow) */
  shortLabel?: string;
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
  "arac-tasima",
  "diger",
] as const;

export type SorunTipiId = (typeof TUM_SORUN_TIP_IDLERI)[number];

export const SORUN_TIPLERI: SorunTipi[] = [
  { id: "cekici", label: "Çekici / kurtarma lazım", icon: "towing", shortLabel: "Çekici lazım" },
  { id: "ariza", label: "Araç arızası / çalışmıyor", icon: "towing", shortLabel: "Araç arızası" },
  { id: "lastik", label: "Lastik söndü/patladı", icon: "tire", shortLabel: "Lastik söndü/patladı" },
  { id: "aku", label: "Akü bitti", icon: "battery", shortLabel: "Akü bitti" },
  { id: "yakit", label: "Yakıt/şarj bitti", icon: "fuel", shortLabel: "Yakıt/şarj bitti" },
  { id: "kaza", label: "Kaza / çarpışma", icon: "towing", shortLabel: "Kaza / çarpışma" },
  { id: "kilit", label: "Araç kilitlendi / Anahtar çalışmıyor", icon: "locksmith", shortLabel: "Anahtar / kilit" },
  { id: "arac-tasima", label: "Araç nakliye", icon: "transport", shortLabel: "Araç nakliye" },
  { id: "diger", label: "Diğer", icon: "search", shortLabel: "Diğer" },
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
  "arac-tasima": "arac-tasima",
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

/** Acil talep gönder — kontekstüel etiket */
export function sorunCagriButonEtiketi(sorunTipi?: string): string {
  const id = sorunTipi?.trim();
  switch (id) {
    case "cekici":
    case "ariza":
    case "kaza":
    case "arac-tasima":
      return "ÇEKİCİ ARA";
    case "lastik":
      return "Lastik Yardımı İste";
    case "aku":
      return "Akü Yardımı İste";
    case "yakit":
      return "Yakıt Yardımı İste";
    case "kilit":
      return "Anahtar Yardımı İste";
    default:
      return "Yardım İste";
  }
}

/** Fotoğraf istenen sorun tipleri (çekici / arıza / kaza / diğer) */
export const SORUN_FOTOGRAF_TIPLERI: SorunTipiId[] = [
  "ariza",
  "lastik",
  "kaza",
  "cekici",
  "arac-tasima",
  "diger",
];

/** Çekici / kurtarma — araç modeli alanı gösterilen tipler (opsiyonel) */
export const SORUN_ARAC_MODELI_TIPLERI: SorunTipiId[] = [
  "ariza",
  "kaza",
  "cekici",
  "arac-tasima",
];

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

export function sorunLastikDurumuAlaniGoster(sorunTipi?: string): boolean {
  return talepSorunTipi({ sorunTipi: sorunTipi }) === "lastik";
}

export function sorunLastikDurumuGerekliMi(sorunTipi?: string): boolean {
  return sorunLastikDurumuAlaniGoster(sorunTipi);
}

export function sorunYakitTipiAlaniGoster(sorunTipi?: string): boolean {
  return talepSorunTipi({ sorunTipi: sorunTipi }) === "yakit";
}

export function sorunYakitTipiGerekliMi(sorunTipi?: string): boolean {
  return sorunYakitTipiAlaniGoster(sorunTipi);
}

export function sorunKilitDurumuAlaniGoster(sorunTipi?: string): boolean {
  return talepSorunTipi({ sorunTipi: sorunTipi }) === "kilit";
}

export function sorunKilitDurumuGerekliMi(sorunTipi?: string): boolean {
  return sorunKilitDurumuAlaniGoster(sorunTipi);
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

/** Teklif notu alanı — sorun tipine özel örnek placeholder */
export function sorunTeklifNotuPlaceholder(sorunTipi?: string): string {
  const id = sorunTipi?.trim()
    ? talepSorunTipi({ sorunTipi })
    : "diger";
  switch (id) {
    case "cekici":
      return "Örn:\nAraç yürümüyor, çekici lazım.\nVeya otoyolda kaldım, sağ şeritteyim.";
    case "ariza":
      return "Örn:\nMotor çalışmıyor / stop etti.\nVeya motordan duman çıkıyor.";
    case "lastik":
      return "Örn:\nÖn sağ lastik patladı, stepne yok.\nVeya jant hasarlı, lastik değişimi lazım.";
    case "aku":
      return "Örn:\nAraç hiç çalışmıyor, akü bitmiş olabilir.\nVeya farlar açık kaldı, kontak vermiyor.";
    case "yakit":
      return "Örn:\nYolda kaldım, en yakın istasyona destek lazım.\nVeya araç tamamen stop etti.";
    case "kaza":
      return "Örn:\nKaza yaptım, araç yürümüyor.\nVeya çarpışma sonrası lastik/şasi hasarı var.";
    case "kilit":
      return "Örn:\nAraç marka/modeli ve plaka.\nVeya yedek anahtar var mı yazın.";
    case "arac-tasima":
      return "Örn:\nAracı şehir içinde nakliye etmek istiyorum.\nVeya satılık araç, adresler arası nakil.";
    case "diger":
    default:
      return "Örn:\nSorununuzu kısaca yazın.\nVeya konum / durum hakkında ek bilgi ekleyin.";
  }
}
