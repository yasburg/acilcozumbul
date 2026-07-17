import { redirect } from "next/navigation";
import MusteriAnaSayfa from "@/components/musteri/MusteriAnaSayfa";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCurrentCekici } from "@/lib/auth";
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

export default async function HomePage() {
  const cekici = await getCurrentCekici();
  if (cekici) {
    redirect("/cekici/panel");
  }

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
