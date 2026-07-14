import MusteriAnaSayfa from "@/components/musteri/MusteriAnaSayfa";
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

export const metadata = sayfaMetadata({
  title: SEO_BASLIK,
  description: SEO_ACIKLAMA,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
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
      <MusteriAnaSayfa />
    </>
  );
}
