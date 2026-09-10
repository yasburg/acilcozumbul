import {
  seoIlceListesi,
  seoSehirGetir,
  seoSehirListesi,
} from "@/lib/seo-geo";
import {
  SEO_HIZMET_SLUGS,
  type SeoHizmetSlug,
} from "@/lib/seo-hizmetler";
import {
  seoIlceHubKaliteSonuc,
  seoIlceHizmetKaliteSonuc,
  seoKaliteGecerMi,
} from "@/lib/seo-kalite-kapisi";

/**
 * SEO yayın (crawl bütçesi):
 *
 * Tüm iller (canlı + sitemap + index):
 *   /{sehir} · /{sehir}/{hizmet} · /{sehir}/{ilce}
 *   — ilçe hub: Faz E kalite kapısı düşük değer periferide noindex olabilir
 *
 * Yalnızca “büyük 5” (derin) + kalite kapısı geçenler:
 *   /{sehir}/{ilce}/{hizmet} → sitemap + index
 *
 * Diğer illerin ilçe×hizmet sayfaları canlı kalır ama noindex + sitemap dışı;
 * ileride SEO_DERIN_SEHIRLER’e eklenince + kapıdan geçince açılır.
 *
 * Faz E detay: docs/seo-faz-e-kalite-kapisi.md
 */
export const SEO_DERIN_SEHIRLER = [
  "istanbul",
  "ankara",
  "izmir",
  "bursa",
  "antalya",
] as const;

export type SeoDerinSehir = (typeof SEO_DERIN_SEHIRLER)[number];

export function seoDerinSehirMi(sehir: string): boolean {
  return (SEO_DERIN_SEHIRLER as readonly string[]).includes(sehir);
}

/** Şehir×hizmet / ilçe sayfası üretilen iller */
export function seoYayinSehirSluglari(): string[] {
  return seoSehirListesi().map((s) => s.slug);
}

export const SEO_YAYIN_SEHIRLER: readonly string[] = seoYayinSehirSluglari();

export type SeoYayinSehir = string;

export function seoSehirYayindaMi(slug: string): boolean {
  return seoSehirGetir(slug) !== null;
}

/** İlçe hub sayfası var mı? (tüm yayın illeri) */
export function seoIlceYayindaMi(sehir: string, ilce: string): boolean {
  if (!seoSehirYayindaMi(sehir)) return false;
  return seoIlceListesi(sehir).some((i) => i.slug === ilce);
}

/** İlçe × hizmet sayfası var mı? (canlı — index ayrı) */
export function seoIlceHizmetYayindaMi(
  sehir: string,
  ilce: string,
  hizmet: string
): boolean {
  if (!seoIlceYayindaMi(sehir, ilce)) return false;
  return (SEO_HIZMET_SLUGS as readonly string[]).includes(hizmet);
}

export function seoSehirHizmetYayindaMi(
  sehir: string,
  hizmet: string
): hizmet is SeoHizmetSlug {
  if (!seoSehirYayindaMi(sehir)) return false;
  return (SEO_HIZMET_SLUGS as readonly string[]).includes(hizmet);
}

/** generateStaticParams / iç link — tüm yayın illerinin ilçeleri */
export function seoYayinIlceSluglari(sehir: string): string[] {
  if (!seoSehirYayindaMi(sehir)) return [];
  return seoIlceListesi(sehir).map((i) => i.slug);
}

/**
 * Sitemap ilçe hub listesi — kalite kapısından geçenler.
 * (Canlı sayfa yine üretilir; noindex ayrı.)
 */
export function seoSitemapIlceSluglari(sehir: string): string[] {
  return seoYayinIlceSluglari(sehir).filter((ilce) =>
    seoIlceIndexlensinMi(sehir, ilce)
  );
}

/**
 * Sitemap + index: ilçe×hizmet yalnız büyük 5 + kalite kapısı.
 * `ilce` / `hizmet` verilmezse (eski imza): yalnız derin şehir mi? — test uyumu.
 */
export function seoIlceHizmetIndexlensinMi(
  sehir: string,
  ilce?: string,
  hizmet?: string
): boolean {
  if (!seoDerinSehirMi(sehir)) return false;
  if (!ilce || !hizmet) return true;
  return seoKaliteGecerMi(seoIlceHizmetKaliteSonuc(sehir, ilce, hizmet));
}

/**
 * İlçe hub index: muhafazakâr Faz E kuralı.
 * `ilce` yoksa true (şehir düzeyinde “hub’lar genel olarak indexlenir”).
 */
export function seoIlceIndexlensinMi(sehir: string, ilce?: string): boolean {
  if (!ilce) return true;
  if (!seoIlceYayindaMi(sehir, ilce)) return false;
  return seoKaliteGecerMi(seoIlceHubKaliteSonuc(sehir, ilce));
}
