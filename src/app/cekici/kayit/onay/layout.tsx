import type { Metadata } from "next";
import { sayfaMetadata } from "@/lib/seo";

export const metadata: Metadata = sayfaMetadata({
  title: "Kayıt Onayı",
  description:
    "Acil Çözüm Bul hizmet veren kaydınız tamamlandı. Panele yönlendiriliyorsunuz.",
  path: "/cekici/kayit/onay",
  noIndex: true,
});

export default function KayitOnayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
