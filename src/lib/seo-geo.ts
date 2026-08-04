import { IL_ILCELER, ilGecerliMi, type DesteklenenIl } from "@/lib/il-ilce";
import { ilceSlug, sehirSlug } from "@/lib/seo-slug";

export type SeoSehirKayit = {
  slug: string;
  ad: DesteklenenIl;
};

export type SeoIlceKayit = {
  slug: string;
  ad: string;
  sehirSlug: string;
};

const sehirBySlug = new Map<string, SeoSehirKayit>();
const ilcelerBySehir = new Map<string, SeoIlceKayit[]>();
const ilceBySehirVeSlug = new Map<string, SeoIlceKayit>();

function indeksKur(): void {
  if (sehirBySlug.size > 0) return;
  for (const ad of Object.keys(IL_ILCELER)) {
    if (!ilGecerliMi(ad)) continue;
    const slug = sehirSlug(ad);
    const kayit: SeoSehirKayit = { slug, ad };
    sehirBySlug.set(slug, kayit);
    const ilceler: SeoIlceKayit[] = IL_ILCELER[ad].map((ilceAd) => ({
      slug: ilceSlug(ilceAd),
      ad: ilceAd,
      sehirSlug: slug,
    }));
    ilcelerBySehir.set(slug, ilceler);
    for (const ilce of ilceler) {
      ilceBySehirVeSlug.set(`${slug}/${ilce.slug}`, ilce);
    }
  }
}

export function seoSehirGetir(slug: string): SeoSehirKayit | null {
  indeksKur();
  return sehirBySlug.get(slug) ?? null;
}

export function seoIlceGetir(
  sehir: string,
  ilce: string
): SeoIlceKayit | null {
  indeksKur();
  return ilceBySehirVeSlug.get(`${sehir}/${ilce}`) ?? null;
}

export function seoIlceListesi(sehirSlugAd: string): SeoIlceKayit[] {
  indeksKur();
  return ilcelerBySehir.get(sehirSlugAd) ?? [];
}

export function seoSehirListesi(): SeoSehirKayit[] {
  indeksKur();
  return [...sehirBySlug.values()].sort((a, b) =>
    a.ad.localeCompare(b.ad, "tr")
  );
}
