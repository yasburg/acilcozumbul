"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { IlceSecimi } from "@/components/IlceSecimi";
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

interface BolgeData {
  il: string;
  tumIlceler: string[];
  seciliIlceler: string[];
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
  const [bolge, setBolge] = useState<BolgeData | null>(null);
  const [secili, setSecili] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");

  const yukle = useCallback(async () => {
    const [statRes, bolgeRes] = await Promise.all([
      fetch("/api/cekici/istatistik"),
      fetch("/api/cekici/bolgeler"),
    ]);
    if (!statRes.ok || !bolgeRes.ok) {
      router.push("/cekici/giris");
      return;
    }
    setStats(await statRes.json());
    const b = await bolgeRes.json();
    setBolge(b);
    setSecili(b.seciliIlceler ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  function toggleIlce(ilce: string) {
    setSecili((prev) =>
      prev.includes(ilce) ? prev.filter((i) => i !== ilce) : [...prev, ilce]
    );
    setMesaj("");
  }

  async function kaydet() {
    setKaydediyor(true);
    setHata("");
    setMesaj("");
    try {
      const res = await fetch("/api/cekici/bolgeler", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ilceler: secili }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSecili(data.seciliIlceler);
      setMesaj(data.mesaj);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setKaydediyor(false);
    }
  }

  return (
    <MobileShell backHref="/cekici/panel?tab=hesabim" subtitle="Ayarlar">
      {loading && (
        <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
      )}

      {!loading && bolge && (
        <div className="space-y-6 animate-fade-in">
          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Hizmet bölgeleri
            </h2>
            <Card className="mb-3">
              <p className="text-sm text-slate-600 leading-relaxed">
                Sadece seçtiğiniz ilçelerden gelen talepler için SMS bildirimi
                alırsınız. İlçe seçmezseniz bildirim gitmez.
              </p>
            </Card>

            {hata && (
              <Card className="mb-3 border-red-200 bg-red-50">
                <p className="text-sm text-red-700">{hata}</p>
              </Card>
            )}
            {mesaj && (
              <Card className="mb-3 border-emerald-200 bg-emerald-50">
                <p className="text-sm text-emerald-800">{mesaj}</p>
              </Card>
            )}

            <IlceSecimi
              il={bolge.il}
              tumIlceler={bolge.tumIlceler}
              seciliIlceler={secili}
              onToggle={toggleIlce}
              onTumunuSec={() => setSecili([...bolge.tumIlceler])}
              onTemizle={() => setSecili([])}
            />

            <div className="mt-4">
              <Btn onClick={kaydet} disabled={kaydediyor}>
                {kaydediyor ? "Kaydediliyor…" : "Bölgeleri kaydet"}
              </Btn>
            </div>
          </section>

          {stats && (
            <>
              <section>
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                  İstatistikler
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <StatKutu
                    baslik="Kazandıklarım"
                    deger={stats.satinAldiklarim}
                    alt="toplam"
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
                  Mevcut kredi
                </p>
                <p className="text-4xl font-bold text-amber-600">
                  {formatKredi(stats.mevcutKredi)}
                </p>
              </Card>
            </>
          )}

          <Link href="/cekici/kredi">
            <Btn variant="secondary">💳 Kredi Satın Al</Btn>
          </Link>
        </div>
      )}
    </MobileShell>
  );
}
