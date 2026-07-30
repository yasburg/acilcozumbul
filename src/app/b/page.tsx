import MusteriDonusumSayfa from "@/components/musteri/MusteriDonusumSayfa";
import { CekiciOturumYonlendir } from "@/components/musteri/CekiciOturumYonlendir";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  faqJsonLd,
  organizationJsonLd,
  sayfaMetadata,
  SEO_ACIKLAMA,
  SEO_BASLIK,
  serviceJsonLd,
  webSiteJsonLd,
} from "@/lib/seo";

/** Anonim HTML cache’lenebilir; oturum yönlendirmesi client’ta */
export const dynamic = "force-static";

export const metadata = sayfaMetadata({
  title: SEO_BASLIK,
  description: SEO_ACIKLAMA,
  path: "/b",
  absoluteTitle: true,
});

export default function MusteriDonusumLandingPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webSiteJsonLd(),
          serviceJsonLd(),
          faqJsonLd(),
        ]}
      />
      <CekiciOturumYonlendir />
      <MusteriDonusumSayfa />
    </>
  );
}
