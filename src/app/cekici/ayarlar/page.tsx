"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MobileShell } from "@/components/MobileShell";
import { BolgeAyarlari } from "@/components/BolgeAyarlari";
import { SorunTipiSecimi } from "@/components/SorunTipiSecimi";
import { Btn, Card } from "@/components/ui";
import type { SorunTipi } from "@/lib/sorun-tipleri";
import { formatKredi } from "@/lib/talep-utils";
import { cekiciFetch, cekiciJson } from "@/lib/cekici-fetch";
import type { HizmetBolgeModu, HizmetBolgeleri } from "@/lib/types";

interface Istatistik {
  satinAldiklarim: number;
  beniTercihEdenler: number;
  tercihEdilmedim: number;
  tercihOrani: number;
  tercihPuani: number | null;
  fiyatGarantiPuani: number;
  fiyatGarantiYuzde: number;
  hizmetPuani: number | null;
  hizmetDegerlendirmeAdet: number;
  buHaftaHarcanan: number;
  mevcutKredi: number;
}

interface BolgeApiData {
  mod: HizmetBolgeModu;
  bolgeler: HizmetBolgeleri;
  menzilKm: number;
  konumGuncel?: boolean;
  konumGuncelleme?: string | null;
  tumIller: readonly string[];
  istanbul: {
    il: string;
    avrupa: string[];
    asya: string[];
  };
  schemaUyari?: string;
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
  vurgu?: "amber" | "emerald" | "red" | "slate" | "blue";
}) {
  const renk = {
    amber: "text-amber-600",
    emerald: "text-emerald-600",
    red: "text-red-600",
    slate: "text-slate-900",
    blue: "text-blue-600",
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
  const [bolge, setBolge] = useState<BolgeApiData | null>(null);
  const [tumSorunTipleri, setTumSorunTipleri] = useState<SorunTipi[]>([]);
  const [seciliSorunTipleri, setSeciliSorunTipleri] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorunKaydediyor, setSorunKaydediyor] = useState(false);
  const [bolgeMesaj, setBolgeMesaj] = useState("");
  const [sorunMesaj, setSorunMesaj] = useState("");
  const [bolgeHata, setBolgeHata] = useState("");
  const [sorunHata, setSorunHata] = useState("");

  const yukle = useCallback(async () => {
    const [statRes, bolgeRes, sorunRes] = await Promise.all([
      cekiciFetch("/api/cekici/istatistik"),
      cekiciFetch("/api/cekici/bolgeler"),
      cekiciFetch("/api/cekici/sorun-tipleri"),
    ]);
    if (
      statRes.status === 401 ||
      bolgeRes.status === 401 ||
      sorunRes.status === 401
    ) {
      router.push("/cekici/giris");
      return;
    }

    if (statRes.ok) {
      setStats(await cekiciJson(statRes));
    }

    const bolgeData = await cekiciJson<BolgeApiData & { error?: string }>(
      bolgeRes
    );
    if (bolgeRes.ok) {
      setBolge(bolgeData);
      setBolgeHata(bolgeData.schemaUyari ?? "");
    } else {
      setBolge(null);
      setBolgeHata(bolgeData.error ?? "Bölge ayarları yüklenemedi.");
    }

    if (sorunRes.ok) {
      const s = await cekiciJson<{
        tumTipler?: SorunTipi[];
        seciliTipler?: string[];
      }>(sorunRes);
      setTumSorunTipleri(s.tumTipler ?? []);
      setSeciliSorunTipleri(s.seciliTipler ?? []);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  function toggleSorunTipi(id: string) {
    setSeciliSorunTipleri((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
    setSorunMesaj("");
  }

  async function sorunTipleriKaydet() {
    setSorunKaydediyor(true);
    setSorunHata("");
    setSorunMesaj("");
    try {
      const res = await cekiciFetch("/api/cekici/sorun-tipleri", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipler: seciliSorunTipleri }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSeciliSorunTipleri(data.seciliTipler);
      setSorunMesaj(data.mesaj);
    } catch (e) {
      setSorunHata(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setSorunKaydediyor(false);
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

            {bolgeHata && (
              <Card className="mb-3 border-red-200 bg-red-50">
                <p className="text-sm text-red-700">{bolgeHata}</p>
              </Card>
            )}
            {bolgeMesaj && (
              <Card className="mb-3 border-emerald-200 bg-emerald-50">
                <p className="text-sm text-emerald-800">{bolgeMesaj}</p>
              </Card>
            )}

            <BolgeAyarlari
              baslangic={bolge}
              onKaydedildi={(mesaj) => {
                setBolgeMesaj(mesaj);
                setBolgeHata("");
                void yukle();
              }}
              onHata={(mesaj) => {
                setBolgeHata(mesaj);
                setBolgeMesaj("");
              }}
            />
          </section>

          <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
              Hizmet verdiğim sorunlar
            </h2>
            <Card className="mb-3">
              <p className="text-sm text-slate-600 leading-relaxed">
                Yalnızca işaretlediğiniz sorun tipleri için talep SMS&apos;i
                alırsınız.
              </p>
            </Card>

            {sorunHata && (
              <Card className="mb-3 border-red-200 bg-red-50">
                <p className="text-sm text-red-700">{sorunHata}</p>
              </Card>
            )}
            {sorunMesaj && (
              <Card className="mb-3 border-emerald-200 bg-emerald-50">
                <p className="text-sm text-emerald-800">{sorunMesaj}</p>
              </Card>
            )}

            {tumSorunTipleri.length > 0 && (
              <SorunTipiSecimi
                tumTipler={tumSorunTipleri}
                seciliTipler={seciliSorunTipleri}
                onToggle={toggleSorunTipi}
                onTumunuSec={() =>
                  setSeciliSorunTipleri(tumSorunTipleri.map((t) => t.id))
                }
                onTemizle={() => setSeciliSorunTipleri([])}
              />
            )}

            <div className="mt-4">
              <Btn onClick={sorunTipleriKaydet} disabled={sorunKaydediyor}>
                {sorunKaydediyor ? "Kaydediliyor…" : "Sorun tiplerini kaydet"}
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
                    baslik="Tercih puanı"
                    deger={
                      stats.tercihPuani != null
                        ? `${stats.tercihPuani} / 5`
                        : "—"
                    }
                    alt={
                      stats.tercihPuani != null
                        ? `%${stats.tercihOrani} müşteri tercihi`
                        : "yeni çekici"
                    }
                    vurgu="emerald"
                  />
                  <StatKutu
                    baslik="Hizmet puanı"
                    deger={
                      stats.hizmetPuani != null
                        ? `${stats.hizmetPuani} / 5`
                        : "—"
                    }
                    alt={
                      stats.hizmetDegerlendirmeAdet > 0
                        ? `${stats.hizmetDegerlendirmeAdet} müşteri değerlendirmesi`
                        : "henüz değerlendirme yok"
                    }
                    vurgu="blue"
                  />
                  <StatKutu
                    baslik="Fiyat garantisi"
                    deger={`${stats.fiyatGarantiPuani} / 5`}
                    alt={`%${stats.fiyatGarantiYuzde} sabit fiyat`}
                    vurgu="slate"
                  />
                  <StatKutu
                    baslik="Tercih edilmedim"
                    deger={stats.tercihEdilmedim}
                    vurgu="red"
                  />
                  <StatKutu
                    baslik="Bu hafta SMS"
                    deger={formatKredi(stats.buHaftaHarcanan)}
                    alt="kredi harcandı"
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
