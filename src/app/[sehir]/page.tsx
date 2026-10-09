import { notFound } from "next/navigation";
import MusteriAnaSayfa from "@/components/musteri/MusteriAnaSayfa";
import { CekiciOturumYonlendir } from "@/components/musteri/CekiciOturumYonlendir";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  faqJsonLd,
  organizationJsonLd,
  sayfaMetadata,
  serviceJsonLd,
  webSiteJsonLd,
} from "@/lib/seo";
import { seoSehirGetir, seoSehirListesi } from "@/lib/seo-geo";
import { ISTANBUL_ANA_HERO } from "@/components/seo/SehirSeoIcerikBolumu";
import { ISTANBUL_IL } from "@/lib/istanbul-ilceler";
import {
  sehirHubIcerik,
  seoBolgeBaglantilari,
} from "@/lib/seo-icerik";
import { SEO_HIZMET_SLUGS, seoHizmetGetir } from "@/lib/seo-hizmetler";

export const revalidate = 86400;

type Props = { params: Promise<{ sehir: string }> };

export function generateStaticParams() {
  return seoSehirListesi().map((s) => ({ sehir: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { sehir } = await params;
  const kayit = seoSehirGetir(sehir);
  if (!kayit) return {};
  const icerik = sehirHubIcerik(kayit.ad);
  const title =
    kayit.ad === ISTANBUL_IL ? ISTANBUL_ANA_HERO : icerik.title;
  return sayfaMetadata({
    title,
    description: icerik.description,
    path: `/${sehir}`,
    absoluteTitle: true,
  });
}

/**
 * Tüm iller: form + şehir SEO hub (`/{sehir}`).
 * İlçe derin SEO yalnızca seo-yayin derin allowlist (İstanbul).
 */
export default async function SehirHubPage({ params }: Props) {
  const { sehir } = await params;
  const kayit = seoSehirGetir(sehir);
  if (!kayit) notFound();

  const icerik = sehirHubIcerik(kayit.ad);
  const baglantilar = seoBolgeBaglantilari(kayit.ad);
  const ilceLinkleri = baglantilar.filter((l) => l.ad !== kayit.ad);
  /** Hub güçlendirme: şehir×hizmet linkleri crawl yolu */
  const hizmetLinkleri = SEO_HIZMET_SLUGS.map((slug) => {
    const h = seoHizmetGetir(slug)!;
    return { ad: h.etiket, href: `/${sehir}/${slug}` };
  });
  const bolgeLinkleri = [...hizmetLinkleri, ...ilceLinkleri];

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webSiteJsonLd(),
          serviceJsonLd(),
          faqJsonLd(icerik.faq),
        ]}
      />
      <CekiciOturumYonlendir />
      <MusteriAnaSayfa
        funnelId="a"
        varsayilanSehir={kayit.ad}
        seoIcerik={icerik}
        seoHeroBaslik={
          kayit.ad === ISTANBUL_IL ? ISTANBUL_ANA_HERO : icerik.h1
        }
        seoSehirAd={kayit.ad}
        seoBaglantilar={baglantilar}
        seoBolgeLinkleri={bolgeLinkleri}
      />
    </>
  );
}
