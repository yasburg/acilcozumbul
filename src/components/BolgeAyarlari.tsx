"use client";

import { useCallback, useEffect, useState } from "react";
import { IlceSecimi } from "@/components/IlceSecimi";
import { Btn, Card } from "@/components/ui";
import { cekiciFetch, cekiciJson } from "@/lib/cekici-fetch";
import { ISTANBUL_IL } from "@/lib/istanbul-ilceler";
import type { HizmetBolgeModu, HizmetBolgeleri } from "@/lib/types";

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

interface BolgeAyarlariProps {
  baslangic: BolgeApiData;
  onKaydedildi?: (mesaj: string) => void;
  onHata?: (mesaj: string) => void;
}

export function BolgeAyarlari({
  baslangic,
  onKaydedildi,
  onHata,
}: BolgeAyarlariProps) {
  const [mod, setMod] = useState<HizmetBolgeModu>(baslangic.mod);
  const [bolgeler, setBolgeler] = useState<HizmetBolgeleri>(baslangic.bolgeler);
  const [menzilKm, setMenzilKm] = useState(baslangic.menzilKm);
  const [aktifIl, setAktifIl] = useState<string>(() => {
    const keys = Object.keys(baslangic.bolgeler);
    return keys[0] ?? baslangic.tumIller[0] ?? "İstanbul";
  });
  const [tumIlceler, setTumIlceler] = useState<string[]>([]);
  const [ilcelerYukleniyor, setIlcelerYukleniyor] = useState(false);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [yeniIl, setYeniIl] = useState("");

  const seciliIlceler = bolgeler[aktifIl] ?? [];

  const ilceListesiYukle = useCallback(async (il: string) => {
    setIlcelerYukleniyor(true);
    try {
      const res = await cekiciFetch("/api/cekici/bolgeler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ il }),
      });
      const data = await cekiciJson<{ error?: string; tumIlceler?: string[] }>(
        res
      );
      if (!res.ok) throw new Error(data.error ?? "İlçe listesi alınamadı.");
      setTumIlceler(data.tumIlceler ?? []);
    } catch {
      setTumIlceler([]);
    } finally {
      setIlcelerYukleniyor(false);
    }
  }, []);

  const aktifIlDegistir = (il: string) => {
    setAktifIl(il);
  };

  useEffect(() => {
    if (mod !== "il_ilce") return;
    void ilceListesiYukle(aktifIl);
  }, [aktifIl, mod, ilceListesiYukle]);

  function toggleIlce(ilce: string) {
    setBolgeler((prev) => {
      const mevcut = prev[aktifIl] ?? [];
      const yeni = mevcut.includes(ilce)
        ? mevcut.filter((i) => i !== ilce)
        : [...mevcut, ilce];
      const next = { ...prev };
      if (yeni.length === 0) delete next[aktifIl];
      else next[aktifIl] = yeni.sort((a, b) => a.localeCompare(b, "tr"));
      return next;
    });
  }

  function istanbulKisayol(tip: "avrupa" | "asya") {
    const liste =
      tip === "avrupa"
        ? baslangic.istanbul.avrupa
        : baslangic.istanbul.asya;
    setAktifIl(ISTANBUL_IL);
    setBolgeler((prev) => ({
      ...prev,
      [ISTANBUL_IL]: [...liste],
    }));
    void ilceListesiYukle(ISTANBUL_IL);
  }

  function ilEkle() {
    const il = yeniIl.trim();
    if (!il || !baslangic.tumIller.includes(il)) return;
    setAktifIl(il);
    setYeniIl("");
    void ilceListesiYukle(il);
  }

  async function kaydet() {
    setKaydediyor(true);
    try {
      const res = await cekiciFetch("/api/cekici/bolgeler", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mod,
          bolgeler: mod === "il_ilce" ? bolgeler : {},
          menzilKm,
        }),
      });
      const data = await cekiciJson<{
        error?: string;
        mesaj?: string;
        mod?: HizmetBolgeModu;
        bolgeler?: HizmetBolgeleri;
        menzilKm?: number;
      }>(res);
      if (!res.ok) throw new Error(data.error ?? "Kayıt başarısız.");
      setMod(data.mod ?? mod);
      setBolgeler(data.bolgeler ?? {});
      setMenzilKm(data.menzilKm ?? menzilKm);
      onKaydedildi?.(data.mesaj ?? "Kaydedildi.");
    } catch (e) {
      onHata?.(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setKaydediyor(false);
    }
  }

  const seciliIlSayisi = Object.keys(bolgeler).length;
  const seciliIlceToplam = Object.values(bolgeler).reduce(
    (n, arr) => n + arr.length,
    0
  );

  return (
    <div className="space-y-4">
      {baslangic.schemaUyari && (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900 leading-relaxed">
            {baslangic.schemaUyari}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMod("il_ilce")}
          className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
            mod === "il_ilce"
              ? "border-amber-400 bg-amber-50 text-amber-900"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          İl / ilçe
        </button>
        <button
          type="button"
          onClick={() => setMod("konum")}
          className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
            mod === "konum"
              ? "border-amber-400 bg-amber-50 text-amber-900"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          Konum + menzil
        </button>
      </div>

      {mod === "il_ilce" ? (
        <>
          <Card>
            <p className="text-sm text-slate-600 leading-relaxed">
              Birden fazla il ve ilçe seçebilirsiniz. Yalnızca seçili
              bölgelerdeki talepler için SMS ve açık ihale görünür.
            </p>
            {seciliIlceToplam > 0 && (
              <p className="text-xs text-amber-800 mt-2 font-medium">
                {seciliIlSayisi} il, {seciliIlceToplam} ilçe seçili
              </p>
            )}
          </Card>

          <div className="flex gap-2 flex-wrap">
            {Object.keys(bolgeler).map((il) => (
              <button
                key={il}
                type="button"
                onClick={() => aktifIlDegistir(il)}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  aktifIl === il
                    ? "border-amber-400 bg-amber-50 text-amber-900"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {il} ({bolgeler[il]?.length ?? 0})
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <select
              value={yeniIl}
              onChange={(e) => setYeniIl(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">İl ekle…</option>
              {baslangic.tumIller.map((il) => (
                <option key={il} value={il}>
                  {il}
                </option>
              ))}
            </select>
            <Btn type="button" variant="outline" onClick={ilEkle} disabled={!yeniIl}>
              Ekle
            </Btn>
          </div>

          <div className="flex gap-2">
            <select
              value={aktifIl}
              onChange={(e) => aktifIlDegistir(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium"
            >
              {baslangic.tumIller.map((il) => (
                <option key={il} value={il}>
                  {il}
                </option>
              ))}
            </select>
          </div>

          {aktifIl === ISTANBUL_IL && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => istanbulKisayol("avrupa")}
                className="flex-1 text-sm py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium"
              >
                🌍 Avrupa (tümü)
              </button>
              <button
                type="button"
                onClick={() => istanbulKisayol("asya")}
                className="flex-1 text-sm py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium"
              >
                🌏 Asya (tümü)
              </button>
            </div>
          )}

          {ilcelerYukleniyor ? (
            <p className="text-sm text-slate-500 text-center py-6">İlçeler yükleniyor…</p>
          ) : (
            <IlceSecimi
              il={aktifIl}
              tumIlceler={tumIlceler}
              seciliIlceler={seciliIlceler}
              onToggle={toggleIlce}
              onTumunuSec={() =>
                setBolgeler((prev) => ({
                  ...prev,
                  [aktifIl]: [...tumIlceler],
                }))
              }
              onTemizle={() =>
                setBolgeler((prev) => {
                  const next = { ...prev };
                  delete next[aktifIl];
                  return next;
                })
              }
            />
          )}
        </>
      ) : (
        <>
          <Card>
            <p className="text-sm text-slate-600 leading-relaxed">
              Çekici panelinde konumunuz <strong>dakikada bir</strong>{" "}
              güncellenir. Talep, bu noktaya olan mesafe menziliniz içindeyse
              size düşer.
            </p>
            {baslangic.konumGuncel ? (
              <p className="text-xs text-emerald-700 mt-2">
                ✓ Son konum güncel
                {baslangic.konumGuncelleme &&
                  ` (${new Date(baslangic.konumGuncelleme).toLocaleTimeString("tr-TR")})`}
              </p>
            ) : (
              <p className="text-xs text-amber-700 mt-2">
                Konum henüz yok — kaydettikten sonra panele girin ve konum
                iznini verin.
              </p>
            )}
          </Card>

          <label className="block space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">Menzil</span>
              <span className="text-amber-700 font-semibold">{menzilKm} km</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={menzilKm}
              onChange={(e) => setMenzilKm(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>0 km</span>
              <span>100 km</span>
            </div>
          </label>
        </>
      )}

      <Btn onClick={() => void kaydet()} disabled={kaydediyor}>
        {kaydediyor ? "Kaydediliyor…" : "Bölge ayarlarını kaydet"}
      </Btn>
    </div>
  );
}
