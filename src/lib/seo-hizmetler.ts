import type { SorunTipiId } from "@/lib/sorun-tipleri";

/** SEO URL slug’ları (doküman: şehir/ilçe-hizmet) */
export const SEO_HIZMET_SLUGS = [
  "cekici",
  "lastikci",
  "aku-takviye",
  "oto-anahtarci",
  "yakit-yardimi",
  "yol-yardim",
] as const;

export type SeoHizmetSlug = (typeof SEO_HIZMET_SLUGS)[number];

export type SeoHizmetTanim = {
  slug: SeoHizmetSlug;
  /** Görünen kısa ad */
  etiket: string;
  /** Title / H1 için ad */
  etiketUzun: string;
  /**
   * Talep formu `?hizmet=` değeri.
   * `yol-yardim` geneldir — formda hizmet seçimi açık kalır (null).
   */
  sorunTipi: SorunTipiId | null;
  /** Form query’de kullanılacak alias (`hizmetQuerydenSorunTipi`) */
  formHizmetQuery: string | null;
};

export const SEO_HIZMETLER: Record<SeoHizmetSlug, SeoHizmetTanim> = {
  cekici: {
    slug: "cekici",
    etiket: "Çekici",
    etiketUzun: "Çekici",
    sorunTipi: "cekici",
    formHizmetQuery: "cekici",
  },
  lastikci: {
    slug: "lastikci",
    etiket: "Lastikçi",
    etiketUzun: "Mobil lastikçi",
    sorunTipi: "lastik",
    formHizmetQuery: "lastik",
  },
  "aku-takviye": {
    slug: "aku-takviye",
    etiket: "Akü takviye",
    etiketUzun: "Akü takviyesi",
    sorunTipi: "aku",
    formHizmetQuery: "aku",
  },
  "oto-anahtarci": {
    slug: "oto-anahtarci",
    etiket: "Oto anahtarcı",
    etiketUzun: "Oto anahtarcı",
    sorunTipi: "kilit",
    formHizmetQuery: "anahtar",
  },
  "yakit-yardimi": {
    slug: "yakit-yardimi",
    etiket: "Yakıt yardımı",
    etiketUzun: "Yakıt yardımı",
    sorunTipi: "yakit",
    formHizmetQuery: "yakit",
  },
  "yol-yardim": {
    slug: "yol-yardim",
    etiket: "Yol yardım",
    etiketUzun: "Yol yardım",
    sorunTipi: null,
    formHizmetQuery: null,
  },
};

export function seoHizmetMi(slug: string): slug is SeoHizmetSlug {
  return (SEO_HIZMET_SLUGS as readonly string[]).includes(slug);
}

export function seoHizmetGetir(slug: string): SeoHizmetTanim | null {
  if (!seoHizmetMi(slug)) return null;
  return SEO_HIZMETLER[slug];
}

export function seoHizmetListesi(): SeoHizmetTanim[] {
  return SEO_HIZMET_SLUGS.map((s) => SEO_HIZMETLER[s]);
}
