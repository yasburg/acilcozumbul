"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BolgeAyarlari } from "@/components/BolgeAyarlari";
import { MusaitlikAyarlari } from "@/components/cekici/MusaitlikAyarlari";
import { PremiumSmsAyarlari } from "@/components/cekici/PremiumSmsAyarlari";
import { KisiselVeriGizlemeAyarlari } from "@/components/cekici/KisiselVeriGizlemeAyarlari";
import { SorunTipiSecimi } from "@/components/SorunTipiSecimi";
import { Btn, Card } from "@/components/ui";
import type { SorunTipi } from "@/lib/sorun-tipleri";
import { cekiciFetch, cekiciJson } from "@/lib/cekici-fetch";
import type { HizmetBolgeModu, HizmetBolgeleri } from "@/lib/types";

interface BolgeApiData {
  mod: HizmetBolgeModu;
  bolgeler: HizmetBolgeleri;
  menzilKm: number;
  konumGuncel?: boolean;
  konumGuncelleme?: string | null;
  sehir?: string | null;
  tumIller: readonly string[];
  istanbul: {
    il: string;
    avrupa: string[];
    asya: string[];
  };
  schemaUyari?: string;
}

export function CekiciAyarlarPanel() {
  const router = useRouter();
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
    const [bolgeRes, sorunRes] = await Promise.all([
      cekiciFetch("/api/cekici/bolgeler"),
      cekiciFetch("/api/cekici/sorun-tipleri"),
    ]);
    if (bolgeRes.status === 401 || sorunRes.status === 401) {
      router.push("/cekici/giris");
      return;
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
    void yukle();
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

  if (loading) {
    return <p className="text-center text-slate-500 py-12">Yükleniyor…</p>;
  }

  if (!bolge) {
    return (
      <Card className="border-red-200 bg-red-50">
        <p className="text-sm text-red-700">
          {bolgeHata || "Ayarlar yüklenemedi."}
        </p>
      </Card>
    );
  }

  return (
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
            Yalnızca işaretlediğiniz sorun tipleri için talep bildirimi
            alırsınız (standart toplu SMS veya Premium OTP SMS).
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
          <Btn onClick={() => void sorunTipleriKaydet()} disabled={sorunKaydediyor}>
            {sorunKaydediyor ? "Kaydediliyor…" : "Sorun tiplerini kaydet"}
          </Btn>
        </div>
      </section>

      <MusaitlikAyarlari />

      <PremiumSmsAyarlari />

      <KisiselVeriGizlemeAyarlari />
    </div>
  );
}
