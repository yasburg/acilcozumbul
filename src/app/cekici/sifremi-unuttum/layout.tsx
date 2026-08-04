import type { Metadata } from "next";
import { sayfaMetadata } from "@/lib/seo";

export const metadata: Metadata = sayfaMetadata({
  title: "Şifremi unuttum",
  description: "Hizmet veren şifre sıfırlama.",
  path: "/cekici/sifremi-unuttum",
  noIndex: true,
});

export default function SifremiUnuttumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
