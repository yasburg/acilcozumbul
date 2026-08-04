import {
  seoIlceListesi,
  seoSehirGetir,
  seoSehirListesi,
} from "@/lib/seo-geo";
import {
  SEO_HIZMET_SLUGS,
  type SeoHizmetSlug,
} from "@/lib/seo-hizmetler";

/**
 * SEO yayın — derin SEO (ilçe hub + hizmet sayfaları).
 * Şehir hub’ları (`/{sehir}`) tüm desteklenen illerde açıktır;
 * ilçe / hizmet path’leri de aynı illerin tamamında yayınlanır.
 * Metinler `seo-icerik` içinde şehir/ilçe adına göre dinamik üretilir.
 */
export function seoYayinSehirSluglari(): string[] {
  return seoSehirListesi().map((s) => s.slug);
}

/** generateStaticParams / sitemap için (tüm iller) */
export const SEO_YAYIN_SEHIRLER: readonly string[] = seoYayinSehirSluglari();

export type SeoYayinSehir = string;

export function seoSehirYayindaMi(slug: string): boolean {
  return seoSehirGetir(slug) !== null;
}

/** İlçe hub sayfası indexlensin mi? */
export function seoIlceYayindaMi(sehir: string, ilce: string): boolean {
  if (!seoSehirYayindaMi(sehir)) return false;
  return seoIlceListesi(sehir).some((i) => i.slug === ilce);
}

/** İlçe × hizmet sayfası indexlensin mi? */
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

/** Sitemap / generateStaticParams için ilçe slug listesi */
export function seoYayinIlceSluglari(sehir: string): string[] {
  return seoIlceListesi(sehir).map((i) => i.slug);
}
