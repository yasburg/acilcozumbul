import { notFound } from "next/navigation";
import MusteriAnaSayfa from "@/components/musteri/MusteriAnaSayfa";
import { CekiciOturumYonlendir } from "@/components/musteri/CekiciOturumYonlendir";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import {
  SEO_YAYIN_SEHIRLER,
  seoIlceYayindaMi,
  seoSehirHizmetYayindaMi,
  seoSehirYayindaMi,
  seoYayinIlceSluglari,
} from "@/data/seo-yayin";
import {
  faqJsonLd,
  organizationJsonLd,
  sayfaMetadata,
  serviceJsonLd,
  webSiteJsonLd,
} from "@/lib/seo";
import { seoIlceGetir, seoSehirGetir } from "@/lib/seo-geo";
import {
  SEO_HIZMET_SLUGS,
  seoHizmetGetir,
  seoHizmetMi,
} from "@/lib/seo-hizmetler";
import {
  ilceHubIcerik,
  sehirHizmetIcerik,
  seoBolgeBaglantilari,
} from "@/lib/seo-icerik";
import { ilceSlug } from "@/lib/seo-slug";
import { seoTalepOlusturYolu } from "@/lib/seo-talep";
import {
  ISTANBUL_ASYA_ILCELER,
  ISTANBUL_AVRUPA_ILCELER,
  ISTANBUL_IL,
} from "@/lib/istanbul-ilceler";

export const revalidate = 86400;

type Props = { params: Promise<{ sehir: string; segment: string }> };

export function generateStaticParams() {
  const out: { sehir: string; segment: string }[] = [];
  for (const sehir of SEO_YAYIN_SEHIRLER) {
    for (const hizmet of SEO_HIZMET_SLUGS) {
      out.push({ sehir, segment: hizmet });
    }
    for (const ilce of seoYayinIlceSluglari(sehir)) {
      out.push({ sehir, segment: ilce });
    }
  }
  return out;
}

export async function generateMetadata({ params }: Props) {
  const { sehir, segment } = await params;
  if (!seoSehirYayindaMi(sehir)) return {};
  const sehirKayit = seoSehirGetir(sehir);
  if (!sehirKayit) return {};

  if (seoHizmetMi(segment) && seoSehirHizmetYayindaMi(sehir, segment)) {
    const hizmet = seoHizmetGetir(segment)!;
    const icerik = sehirHizmetIcerik(sehirKayit.ad, hizmet);
    return sayfaMetadata({
      title: icerik.title,
      description: icerik.description,
      path: `/${sehir}/${segment}`,
      absoluteTitle: true,
    });
  }

  if (seoIlceYayindaMi(sehir, segment)) {
    const ilce = seoIlceGetir(sehir, segment);
    if (!ilce) return {};
    const icerik = ilceHubIcerik(sehirKayit.ad, ilce.ad);
    return sayfaMetadata({
      title: icerik.title,
      description: icerik.description,
      path: `/${sehir}/${segment}`,
      absoluteTitle: true,
    });
  }

  return {};
}

export default async function SehirSegmentPage({ params }: Props) {
  const { sehir, segment } = await params;
  if (!seoSehirYayindaMi(sehir)) notFound();
  const sehirKayit = seoSehirGetir(sehir);
  if (!sehirKayit) notFound();

  if (seoHizmetMi(segment) && seoSehirHizmetYayindaMi(sehir, segment)) {
    const hizmet = seoHizmetGetir(segment)!;
    const icerik = sehirHizmetIcerik(sehirKayit.ad, hizmet);
    const path = `/${sehir}/${segment}`;
    const ilceLinkleri = seoYayinIlceSluglari(sehir).map((ilceSlugAd) => {
      const ilce = seoIlceGetir(sehir, ilceSlugAd);
      return {
        href: `/${sehir}/${ilceSlugAd}/${segment}`,
        label: ilce?.ad ?? ilceSlugAd,
      };
    });

    return (
      <SeoLandingShell
        icerik={icerik}
        path={path}
        areaName={sehirKayit.ad}
        breadcrumb={[
          { name: "Ana Sayfa", path: "/" },
          { name: sehirKayit.ad, path: `/${sehir}` },
          { name: hizmet.etiket, path },
        ]}
        ctaHref={seoTalepOlusturYolu({ sehir, hizmet: segment })}
        secimBaslik="İlçenizi seçin"
        secimAlt={`${hizmet.etiket} için ilçeyi seçin; ardından talep oluşturun.`}
        secimLinkleri={ilceLinkleri}
        ilgili={[
          {
            href: seoTalepOlusturYolu({ sehir, hizmet: segment }),
            label: `${sehirKayit.ad} geneli ${hizmet.etiket} talebi`,
          },
        ]}
      />
    );
  }

  if (seoIlceYayindaMi(sehir, segment)) {
    const ilce = seoIlceGetir(sehir, segment);
    if (!ilce) notFound();
    const icerik = ilceHubIcerik(sehirKayit.ad, ilce.ad);
    const asyaSet = new Set(ISTANBUL_ASYA_ILCELER);
    const yakinHavuz =
      sehirKayit.ad === ISTANBUL_IL
        ? asyaSet.has(ilce.ad)
          ? ISTANBUL_ASYA_ILCELER
          : ISTANBUL_AVRUPA_ILCELER
        : seoYayinIlceSluglari(sehir)
            .map((slug) => seoIlceGetir(sehir, slug)?.ad)
            .filter((ad): ad is string => !!ad);
    const yakinIlceler = yakinHavuz
      .filter((ad) => ad !== ilce.ad)
      .slice(0, 8)
      .map((ad) => ({
        ad,
        href: `/${sehir}/${ilceSlug(ad)}`,
      }));
    const baglantilar = seoBolgeBaglantilari(sehirKayit.ad, {
      yakinIlceler: yakinHavuz.filter((ad) => ad !== ilce.ad).slice(0, 12),
      sadeceYakin: true,
    });

    /** İlçe hub = form + dinamik ilçe SEO (tüm yayınlı şehirler) */
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
          varsayilanSehir={sehirKayit.ad}
          varsayilanIlce={ilce.ad}
          seoIcerik={icerik}
          seoHeroBaslik={icerik.h1}
          seoSehirAd={sehirKayit.ad}
          seoBaglantilar={baglantilar}
          seoBolgeLinkleri={yakinIlceler}
        />
      </>
    );
  }

  notFound();
}
