import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { kayitFunnelGetir } from "@/lib/kayit-funnel";
import { KayitSecimWizardSayfa } from "@/components/kayit/KayitSecimWizardSayfa";

/** Kısa yol: /c → kayıt funnel C (seçim wizard) */
export async function generateMetadata(): Promise<Metadata> {
  const f = kayitFunnelGetir("c");
  if (!f || !f.aktif) return { title: "Kayıt" };
  return {
    title: f.baslik.slice(0, 60),
    robots: { index: true, follow: true },
  };
}

export default function KayitCKisaPage() {
  const funnel = kayitFunnelGetir("c");
  if (!funnel || !funnel.aktif) notFound();
  return <KayitSecimWizardSayfa funnel={funnel} />;
}
