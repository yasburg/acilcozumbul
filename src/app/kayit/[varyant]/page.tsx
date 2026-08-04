import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { kayitFunnelGetir, kayitFunnelMi } from "@/lib/kayit-funnel";
import { CekiciKayitKontrolSayfa } from "@/components/cekici/CekiciKayitKontrolSayfa";
import { KayitPhoneFirstSayfa } from "@/components/kayit/KayitPhoneFirstSayfa";
import { KayitSecimWizardSayfa } from "@/components/kayit/KayitSecimWizardSayfa";

type Props = { params: Promise<{ varyant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { varyant } = await params;
  const f = kayitFunnelGetir(String(varyant ?? "").toLowerCase());
  if (!f || !f.aktif) {
    return { title: "Kayıt", robots: { index: false, follow: false } };
  }
  return {
    title: f.tip === "kontrol" ? "Hizmet veren kaydı" : f.baslik.slice(0, 60),
    robots: { index: false, follow: false },
  };
}

export default async function KayitFunnelPage({ params }: Props) {
  const { varyant: ham } = await params;
  const varyant = String(ham ?? "").toLowerCase();
  if (!kayitFunnelMi(varyant)) notFound();
  const funnel = kayitFunnelGetir(varyant);
  if (!funnel || !funnel.aktif) notFound();

  if (funnel.tip === "kontrol") {
    return <CekiciKayitKontrolSayfa />;
  }

  if (funnel.tip === "secim_wizard") {
    return <KayitSecimWizardSayfa funnel={funnel} />;
  }

  return <KayitPhoneFirstSayfa funnel={funnel} />;
}
