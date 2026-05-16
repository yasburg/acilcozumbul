"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card } from "@/components/ui";
import { formatKredi } from "@/lib/talep-utils";

interface Istatistik {
  satinAldiklarim: number;
  beniTercihEdenler: number;
  tercihEdilmedim: number;
  tercihOrani: number;
  buHaftaHarcanan: number;
  mevcutKredi: number;
}

function StatKutu({
  baslik,
  deger,
  alt,
  vurgu = "slate",
}: {
  baslik: string;
  deger: string | number;
  alt?: string;
  vurgu?: "amber" | "emerald" | "red" | "slate";
}) {
  const renk = {
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    red: "text-red-600",
    slate: "text-slate-900",
  }[vurgu];

  return (
    <Card className="text-center">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{baslik}</p>
      <p className={`text-3xl font-bold mt-1 ${renk}`}>{deger}</p>
      {alt && <p className="text-xs text-slate-400 mt-1">{alt}</p>}
    </Card>
  );
}

export default function AyarlarPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Istatistik | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cekici/istatistik")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setStats)
      .catch(() => router.push("/cekici/giris"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <MobileShell backHref="/cekici/panel?tab=hesabim" subtitle="Ayarlar & İstatistikler">
      {loading && (
        <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
      )}

      {stats && (
        <div className="space-y-6 animate-fade-in">
          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Özet
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <StatKutu
                baslik="Satın aldıklarım"
                deger={stats.satinAldiklarim}
                alt="toplam müşteri"
                vurgu="amber"
              />
              <StatKutu
                baslik="Beni tercih edenler"
                deger={`%${stats.tercihOrani}`}
                alt={`${stats.beniTercihEdenler} anlaşma`}
                vurgu="emerald"
              />
              <StatKutu
                baslik="Tercih edilmedim"
                deger={stats.tercihEdilmedim}
                alt="müşteri başka çekici aradı"
                vurgu="red"
              />
              <StatKutu
                baslik="Bu hafta harcanan"
                deger={formatKredi(stats.buHaftaHarcanan)}
                alt="kredi"
                vurgu="slate"
              />
            </div>
          </section>

          <Card>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
              Mevcut kredi bakiyesi
            </p>
            <p className="text-4xl font-bold text-amber-600">
              {formatKredi(stats.mevcutKredi)}
            </p>
          </Card>

          <Card className="bg-slate-50">
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>Beni tercih edenler oranı</strong>, satın aldığınız
              müşterilerden kaçının sizinle anlaştığını gösterir. Müşteri
              &quot;anlaşamadım&quot; derse talep yeniden açılır; bu müşteri
              artık sizi tercih edemez.
            </p>
          </Card>

          <Link href="/cekici/kredi">
            <Btn>💳 Kredi Satın Al</Btn>
          </Link>

          <Link href="/demo/sms">
            <Btn variant="secondary">📱 Demo SMS Kayıtları</Btn>
          </Link>
        </div>
      )}
    </MobileShell>
  );
}
