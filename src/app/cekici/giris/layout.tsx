import type { Metadata } from "next";
import { CEKICI_GIRIS_SEO, sayfaMetadata } from "@/lib/seo";

export const metadata: Metadata = sayfaMetadata({
  title: CEKICI_GIRIS_SEO.title,
  description: CEKICI_GIRIS_SEO.description,
  path: "/cekici/giris",
});

export default function CekiciGirisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
