import type { Metadata } from "next";
import { sayfaMetadata } from "@/lib/seo";

/** A/B kayıt funnelleri — public SEO /hizmet-veren; burası indeks dışı */
export const metadata: Metadata = sayfaMetadata({
  title: "Hizmet veren kaydı",
  description:
    "Çekici, lastikçi veya anahtarcı kaydı. Bu sayfa bir kayıt deneyidir; genel bilgi için hizmet veren sayfasına bakın.",
  path: "/kayit",
  noIndex: true,
});

export default function KayitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
