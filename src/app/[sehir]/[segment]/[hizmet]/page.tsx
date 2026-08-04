import { notFound } from "next/navigation";
import { SeoLandingShell } from "@/components/seo/SeoLandingShell";
import {
  SEO_YAYIN_SEHIRLER,
  seoIlceHizmetYayindaMi,
  seoYayinIlceSluglari,
} from "@/data/seo-yayin";
import { sayfaMetadata } from "@/lib/seo";
import { seoIlceGetir, seoSehirGetir } from "@/lib/seo-geo";
import {
  SEO_HIZMET_SLUGS,
  seoHizmetGetir,
  seoHizmetMi,
} from "@/lib/seo-hizmetler";
import { ilceHizmetIcerik } from "@/lib/seo-icerik";
import { seoTalepOlusturYolu } from "@/lib/seo-talep";

export const revalidate = 86400;

type Props = {
  params: Promise<{ sehir: string; segment: string; hizmet: string }>;
};

export function generateStaticParams() {
  const out: { sehir: string; segment: string; hizmet: string }[] = [];
  for (const sehir of SEO_YAYIN_SEHIRLER) {
    for (const segment of seoYayinIlceSluglari(sehir)) {
      for (const hizmet of SEO_HIZMET_SLUGS) {
        out.push({ sehir, segment, hizmet });
      }
    }
  }
  return out;
}

export async function generateMetadata({ params }: Props) {
  const { sehir, segment: ilce, hizmet } = await params;
  if (!seoIlceHizmetYayindaMi(sehir, ilce, hizmet) || !seoHizmetMi(hizmet)) {
    return {};
  }
  const sehirKayit = seoSehirGetir(sehir);
  const ilceKayit = seoIlceGetir(sehir, ilce);
  const hizmetKayit = seoHizmetGetir(hizmet);
  if (!sehirKayit || !ilceKayit || !hizmetKayit) return {};
  const icerik = ilceHizmetIcerik(sehirKayit.ad, ilceKayit.ad, hizmetKayit);
  return sayfaMetadata({
    title: icerik.title,
    description: icerik.description,
    path: `/${sehir}/${ilce}/${hizmet}`,
    absoluteTitle: true,
  });
}

export default async function IlceHizmetPage({ params }: Props) {
  const { sehir, segment: ilce, hizmet } = await params;
  if (!seoIlceHizmetYayindaMi(sehir, ilce, hizmet) || !seoHizmetMi(hizmet)) {
    notFound();
  }
  const sehirKayit = seoSehirGetir(sehir);
  const ilceKayit = seoIlceGetir(sehir, ilce);
  const hizmetKayit = seoHizmetGetir(hizmet);
  if (!sehirKayit || !ilceKayit || !hizmetKayit) notFound();

  const icerik = ilceHizmetIcerik(sehirKayit.ad, ilceKayit.ad, hizmetKayit);
  const path = `/${sehir}/${ilce}/${hizmet}`;
  const ilgili = SEO_HIZMET_SLUGS.filter((h) => h !== hizmet).map((h) => {
    const t = seoHizmetGetir(h)!;
    return {
      href: `/${sehir}/${ilce}/${h}`,
      label: `${ilceKayit.ad} ${t.etiket}`,
    };
  });

  const ctaHref = seoTalepOlusturYolu({
    sehir,
    ilce,
    hizmet,
  });

  return (
    <SeoLandingShell
      icerik={icerik}
      path={path}
      areaName={`${ilceKayit.ad}, ${sehirKayit.ad}`}
      breadcrumb={[
        { name: "Ana Sayfa", path: "/" },
        { name: sehirKayit.ad, path: `/${sehir}` },
        { name: ilceKayit.ad, path: `/${sehir}/${ilce}` },
        { name: hizmetKayit.etiket, path },
      ]}
      ctaHref={ctaHref}
      secimBaslik="Talebi oluştur"
      secimAlt="Şehir, ilçe ve hizmet seçili; forma geçin."
      secimLinkleri={[{ href: ctaHref, label: icerik.ctaEtiket }]}
      ilgili={[
        {
          href: `/${sehir}/${hizmet}`,
          label: `${sehirKayit.ad} ${hizmetKayit.etiket}`,
        },
        ...ilgili,
      ]}
    />
  );
}
