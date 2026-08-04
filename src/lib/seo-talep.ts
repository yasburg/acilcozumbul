import { seoIlceYayindaMi } from "@/data/seo-yayin";
import { seoHizmetGetir } from "@/lib/seo-hizmetler";
import { seoSehirGetir } from "@/lib/seo-geo";
import { ilceSlug, sehirSlug } from "@/lib/seo-slug";

/** SEO landing CTA → noindex form yolu */
export const TALEP_OLUSTUR_YOL = "/talep-olustur";

export type SeoTalepQuery = {
  sehir?: string;
  ilce?: string;
  hizmet?: string;
};

/**
 * Form / SEO path: `/` | `/{sehir}` | `/{sehir}/{ilce}`
 * Şehir hub’ları tüm desteklenen illerde; ilçe path yayınlı SEO’da.
 */
export function musteriKonumYolu(
  sehirAd?: string | null,
  ilceAd?: string | null
): string {
  if (!sehirAd?.trim()) return "/";
  const s = sehirSlug(sehirAd.trim());
  if (!seoSehirGetir(s)) return "/";
  if (!ilceAd?.trim()) return `/${s}`;
  const i = ilceSlug(ilceAd.trim());
  if (!seoIlceYayindaMi(s, i)) return `/${s}`;
  return `/${s}/${i}`;
}

/**
 * Yayınlı şehir/ilçe hub = form path; hizmet varsa noindex form.
 */
export function seoTalepOlusturYolu(opts: SeoTalepQuery): string {
  const sehir = opts.sehir?.trim().toLowerCase();
  if (sehir && seoSehirGetir(sehir) && !opts.hizmet) {
    if (opts.ilce) {
      const ilce = opts.ilce.trim().toLowerCase();
      if (seoIlceYayindaMi(sehir, ilce)) return `/${sehir}/${ilce}`;
    }
    return `/${sehir}`;
  }
  const q = new URLSearchParams();
  if (opts.sehir) q.set("sehir", opts.sehir);
  if (opts.ilce) q.set("ilce", opts.ilce);
  if (opts.hizmet) {
    const h = seoHizmetGetir(opts.hizmet);
    const formDeger = h?.formHizmetQuery ?? opts.hizmet;
    if (formDeger) q.set("hizmet", formDeger);
  }
  const qs = q.toString();
  return qs ? `${TALEP_OLUSTUR_YOL}?${qs}` : TALEP_OLUSTUR_YOL;
}
