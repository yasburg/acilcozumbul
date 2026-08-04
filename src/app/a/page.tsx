import MusteriAnaSayfa from "@/components/musteri/MusteriAnaSayfa";
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

/** Müşteri A/B funnel — indeks dışı (kanonik dönüşüm: /) */
export const metadata = sayfaMetadata({
  title: SEO_BASLIK,
  description: SEO_ACIKLAMA,
  path: "/a",
  absoluteTitle: true,
  noIndex: true,
});

/** Müşteri funnel A — klasik anasayfa akışı */
export default function MusteriFunnelAPage() {
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
      <MusteriAnaSayfa funnelId="a" />
    </>
  );
}
