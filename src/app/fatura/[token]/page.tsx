import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentCekici } from "@/lib/auth";
import {
  faturaDeepLinkDegerlendir,
  faturaPath,
  faturaTokenGecerliMi,
} from "@/lib/fatura-link";
import {
  getFaturaLinkByToken,
  isaretleFaturaSonErisim,
} from "@/lib/fatura-link-db";
import { MobileShell } from "@/components/MobileShell";

export const metadata: Metadata = {
  title: "Fatura",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ token: string }> };

export default async function FaturaDeepLinkPage({ params }: Props) {
  const { token } = await params;

  if (!faturaTokenGecerliMi(token)) {
    return <FaturaHata />;
  }

  const cekici = await getCurrentCekici();
  if (!cekici) {
    redirect(`/cekici/giris?next=${encodeURIComponent(faturaPath(token))}`);
  }

  let kayit = null;
  try {
    kayit = await getFaturaLinkByToken(token);
  } catch (e) {
    console.error("[fatura/token]", e);
    return <FaturaHata />;
  }

  const sonuc = faturaDeepLinkDegerlendir({
    oturumCekiciId: cekici.id,
    kayit,
  });

  if (!sonuc.ok) {
    return <FaturaHata />;
  }

  try {
    await isaretleFaturaSonErisim(sonuc.faturaId);
  } catch {
    /* best-effort */
  }

  redirect(`/cekici/faturalar?odak=${encodeURIComponent(sonuc.faturaId)}`);
}

function FaturaHata() {
  return (
    <MobileShell subtitle="Fatura">
      <div className="px-4 py-10 max-w-md mx-auto space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Bağlantı geçersiz</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Bağlantı geçersiz veya süresi dolmuş. Giriş yapıp Faturalarım’dan
          erişebilirsiniz.
        </p>
        <Link
          href="/cekici/faturalar"
          className="inline-flex text-sm font-semibold text-amber-700 underline underline-offset-2"
        >
          Faturalarım
        </Link>
      </div>
    </MobileShell>
  );
}
