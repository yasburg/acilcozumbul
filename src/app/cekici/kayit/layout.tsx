import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  CEKICI_KAYIT_SEO,
  organizationJsonLd,
  sayfaMetadata,
  serviceJsonLd,
} from "@/lib/seo";

/** Redirect hedefi / deney — public SEO: /hizmet-veren */
export const metadata: Metadata = sayfaMetadata({
  title: CEKICI_KAYIT_SEO.title,
  description: CEKICI_KAYIT_SEO.description,
  path: "/cekici/kayit",
  noIndex: true,
});

export default function CekiciKayitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), serviceJsonLd()]} />
      {children}
    </>
  );
}
