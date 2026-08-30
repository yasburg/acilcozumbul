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
import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";

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

type AyarSekme = "bolgeler_hizmetler" | "bildirim_saatler" | "gizlilik";

export function CekiciAyarlarPanel() {
  const router = useRouter();
  const [aktifSekme, setAktifSekme] = useState<AyarSekme>("bolgeler_hizmetler");
  const [bolge, setBolge] = useState<BolgeApiData | null>(null);
  const [tumSorunTipleri, setTumSorunTipleri] = useState<SorunTipi[]>([]);
  const [seciliSorunTipleri, setSeciliSorunTipleri] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorunKaydediyor, setSorunKaydediyor] = useState(false);
  const [sorunTipleriAcik, setSorunTipleriAcik] = useState(false);
  const [bolgeMesaj, setBolgeMesaj] = useState("");
  const [sorunMesaj, setSorunMesaj] = useState("");
  const [bolgeHata, setBolgeHata] = useState("");
  const [sorunHata, setSorunHata] = useState("");

  const MapPin = AcbIcons.mapPin;
  const Bell = AcbIcons.bell;
  const Shield = AcbIcons.shield;
  const Wrench = AcbIcons.wrench;
  const Clock = AcbIcons.clock;

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

  const otoKaydetSorunTipleri = useCallback(async (tipler: string[]) => {
    setSorunKaydediyor(true);
    setSorunHata("");
    try {
      const res = await cekiciFetch("/api/cekici/sorun-tipleri", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipler }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSeciliSorunTipleri(data.seciliTipler ?? tipler);
      setSorunMesaj("Hizmet tipleri güncellendi.");
    } catch (e) {
      setSorunHata(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setSorunKaydediyor(false);
    }
  }, []);

  function toggleSorunTipi(id: string) {
    const next = seciliSorunTipleri.includes(id)
      ? seciliSorunTipleri.filter((t) => t !== id)
      : [...seciliSorunTipleri, id];
    setSeciliSorunTipleri(next);
    void otoKaydetSorunTipleri(next);
  }

  if (loading) {
    return <p className="text-center text-slate-500 py-12 text-sm">Ayarlar yükleniyor…</p>;
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
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Yatay Kaydırılabilir Kategoriler (Tam kenara kadar kayar ve kaydırma çubuğu gizlidir) */}
      <div className="sticky top-0 z-10 -mx-3 sm:-mx-4 px-3 sm:px-4 bg-slate-50/95 backdrop-blur-md pt-1 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
          <button
            type="button"
            onClick={() => setAktifSekme("bolgeler_hizmetler")}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-full text-xs shrink-0 whitespace-nowrap transition-all touch-manipulation cursor-pointer border ${
              aktifSekme === "bolgeler_hizmetler"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-bold shadow-2xs"
                : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 font-medium"
            }`}
          >
            <MapPin
              className={`size-4 shrink-0 ${
                aktifSekme === "bolgeler_hizmetler"
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
              strokeWidth={ACB_ICON_STROKE}
            />
            <span>Bölge & İşler</span>
          </button>

          <button
            type="button"
            onClick={() => setAktifSekme("bildirim_saatler")}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-full text-xs shrink-0 whitespace-nowrap transition-all touch-manipulation cursor-pointer border ${
              aktifSekme === "bildirim_saatler"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-bold shadow-2xs"
                : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 font-medium"
            }`}
          >
            <Bell
              className={`size-4 shrink-0 ${
                aktifSekme === "bildirim_saatler"
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
              strokeWidth={ACB_ICON_STROKE}
            />
            <span>Bildirim & Saatler</span>
          </button>

          <button
            type="button"
            onClick={() => setAktifSekme("gizlilik")}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-full text-xs shrink-0 whitespace-nowrap transition-all touch-manipulation cursor-pointer border ${
              aktifSekme === "gizlilik"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-bold shadow-2xs"
                : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 font-medium"
            }`}
          >
            <Shield
              className={`size-4 shrink-0 ${
                aktifSekme === "gizlilik"
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}
              strokeWidth={ACB_ICON_STROKE}
            />
            <span>Gizlilik & Destek</span>
          </button>
        </div>
      </div>

      {/* SEKME 1: BÖLGE & İŞLER */}
      {aktifSekme === "bolgeler_hizmetler" && (
        <div className="space-y-6 animate-fade-in">
          {/* Hizmet Bölgeleri Bölümü */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="size-4.5 text-emerald-600" strokeWidth={ACB_ICON_STROKE} />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Hizmet Bölgeleriniz
              </h2>
            </div>

            {bolgeHata && (
              <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 font-medium">
                {bolgeHata}
              </div>
            )}
            {bolgeMesaj && (
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 font-medium">
                {bolgeMesaj}
              </div>
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

          {/* Hizmet Verilen Sorun Tipleri Bölümü */}
          <section className="space-y-3 pt-2 border-t border-slate-200/80">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Wrench className="size-4.5 text-emerald-600" strokeWidth={ACB_ICON_STROKE} />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Hizmet Verdiğiniz İş Tipleri
                </h2>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                {seciliSorunTipleri.length} / {tumSorunTipleri.length} Seçili
              </span>
            </div>

            {sorunHata && (
              <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 font-medium">
                {sorunHata}
              </div>
            )}
            {sorunMesaj && (
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 font-medium">
                {sorunMesaj}
              </div>
            )}

            {/* Katlanabilir (Collapsible) Sorun Tipleri Kartı */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Yalnızca işaretlediğiniz iş tipleri için bildirim alırsınız.
                </p>
                <button
                  type="button"
                  onClick={() => setSorunTipleriAcik(!sorunTipleriAcik)}
                  className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 transition cursor-pointer"
                >
                  {sorunTipleriAcik ? "Gizle ▴" : "Düzenle ▾"}
                </button>
              </div>

              {/* Seçili Tipler Özeti (Kapalıyken) */}
              {!sorunTipleriAcik && seciliSorunTipleri.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                  {tumSorunTipleri
                    .filter((t) => seciliSorunTipleri.includes(t.id))
                    .map((t) => (
                      <span
                        key={t.id}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200"
                      >
                        ✓ {t.ad}
                      </span>
                    ))}
                </div>
              )}

              {/* Açıkken Tam Liste ve Kaydet Butonu */}
              {sorunTipleriAcik && tumSorunTipleri.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-3 animate-fade-in">
                  <SorunTipiSecimi
                    tumTipler={tumSorunTipleri}
                    seciliTipler={seciliSorunTipleri}
                    onToggle={toggleSorunTipi}
                    onTumunuSec={() => {
                      const all = tumSorunTipleri.map((t) => t.id);
                      setSeciliSorunTipleri(all);
                      void otoKaydetSorunTipleri(all);
                    }}
                    onTemizle={() => {
                      setSeciliSorunTipleri([]);
                      void otoKaydetSorunTipleri([]);
                    }}
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* SEKME 2: BİLDİRİM & ÇALIŞMA SAATLERİ */}
      {aktifSekme === "bildirim_saatler" && (
        <div className="space-y-6 animate-fade-in">
          {/* Bildirim Paketi */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="size-4.5 text-emerald-600" strokeWidth={ACB_ICON_STROKE} />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Talep Bildirim Tercihi
              </h2>
            </div>
            <PremiumSmsAyarlari />
          </section>

          {/* Müsaitlik Saatleri */}
          <section className="space-y-3 pt-2 border-t border-slate-200/80">
            <div className="flex items-center gap-2">
              <Clock className="size-4.5 text-emerald-600" strokeWidth={ACB_ICON_STROKE} />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Çalışma Saatleri & Müsaitlik
              </h2>
            </div>
            <MusaitlikAyarlari />
          </section>
        </div>
      )}

      {/* SEKME 3: GİZLİLİK & DESTEK */}
      {aktifSekme === "gizlilik" && (
        <div className="space-y-6 animate-fade-in">
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="size-4.5 text-emerald-600" strokeWidth={ACB_ICON_STROKE} />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Gizlilik & Güvenlik
              </h2>
            </div>
            <KisiselVeriGizlemeAyarlari />
          </section>
        </div>
      )}
    </div>
  );
}
