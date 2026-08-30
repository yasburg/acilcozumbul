"use client";

import { useCallback, useEffect, useState } from "react";
import { IlceSecimi } from "@/components/IlceSecimi";
import { BottomSheet } from "@/components/acb/BottomSheet";
import { Btn, Card } from "@/components/ui";
import { cekiciFetch, cekiciJson } from "@/lib/cekici-fetch";
import { ISTANBUL_IL } from "@/lib/istanbul-ilceler";
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
    if (keys[0]) return keys[0];
    if (baslangic.sehir && baslangic.tumIller.includes(baslangic.sehir)) {
      return baslangic.sehir;
    }
    return baslangic.tumIller[0] ?? "İstanbul";
  });
  const [tumIlceler, setTumIlceler] = useState<string[]>([]);
  const [ilcelerYukleniyor, setIlcelerYukleniyor] = useState(false);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [yeniIl, setYeniIl] = useState("");
  const [ilceSheetAcik, setIlceSheetAcik] = useState(false);

  const seciliIlceler = bolgeler[aktifIl] ?? [];
  const MapPin = AcbIcons.mapPin;
  const Navigation = AcbIcons.navigation;

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

  const otoKaydet = useCallback(
    async (
      guncelMod: HizmetBolgeModu,
      guncelBolgeler: HizmetBolgeleri,
      guncelMenzil: number
    ) => {
      setKaydediyor(true);
      try {
        const res = await cekiciFetch("/api/cekici/bolgeler", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mod: guncelMod,
            bolgeler: guncelMod === "il_ilce" ? guncelBolgeler : {},
            menzilKm: guncelMenzil,
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
        onKaydedildi?.(data.mesaj ?? "Ayarlar kaydedildi.");
      } catch (e) {
        onHata?.(e instanceof Error ? e.message : "Kayıt başarısız.");
      } finally {
        setKaydediyor(false);
      }
    },
    [onKaydedildi, onHata]
  );

  function modDegistir(yeniMod: HizmetBolgeModu) {
    setMod(yeniMod);
    void otoKaydet(yeniMod, bolgeler, menzilKm);
  }

  function toggleIlce(ilce: string) {
    const mevcut = bolgeler[aktifIl] ?? [];
    const yeni = mevcut.includes(ilce)
      ? mevcut.filter((i) => i !== ilce)
      : [...mevcut, ilce];
    const next = { ...bolgeler };
    if (yeni.length === 0) delete next[aktifIl];
    else next[aktifIl] = yeni.sort((a, b) => a.localeCompare(b, "tr"));
    setBolgeler(next);
    void otoKaydet(mod, next, menzilKm);
  }

  function ilSil(il: string) {
    const next = { ...bolgeler };
    delete next[il];
    const kalanIller = Object.keys(next);
    if (aktifIl === il && kalanIller.length > 0) {
      setAktifIl(kalanIller[0]);
    }
    setBolgeler(next);
    void otoKaydet(mod, next, menzilKm);
  }

  function istanbulKisayol(tip: "avrupa" | "asya") {
    const liste =
      tip === "avrupa"
        ? baslangic.istanbul.avrupa
        : baslangic.istanbul.asya;
    setAktifIl(ISTANBUL_IL);
    const next = {
      ...bolgeler,
      [ISTANBUL_IL]: [...liste],
    };
    setBolgeler(next);
    void ilceListesiYukle(ISTANBUL_IL);
    void otoKaydet(mod, next, menzilKm);
  }

  function ilEkle() {
    const il = yeniIl.trim();
    if (!il || !baslangic.tumIller.includes(il)) return;
    setAktifIl(il);
    setYeniIl("");
    void ilceListesiYukle(il);
    setIlceSheetAcik(true);
  }

  const seciliIllerListesi = Object.keys(bolgeler);
  const seciliIlSayisi = seciliIllerListesi.length;
  const seciliIlceToplam = Object.values(bolgeler).reduce(
    (n, arr) => n + arr.length,
    0
  );

  return (
    <div className="space-y-4">
      {baslangic.schemaUyari && (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-xs text-amber-900 leading-relaxed">
            {baslangic.schemaUyari}
          </p>
        </Card>
      )}

      {/* Mod Seçici — Modern Segmented Pill */}
      <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200/80 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => modDegistir("il_ilce")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            mod === "il_ilce"
              ? "bg-white text-emerald-950 shadow-sm border border-slate-200/50"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <MapPin
            className={`size-4 ${
              mod === "il_ilce" ? "text-emerald-600" : "text-slate-400"
            }`}
            strokeWidth={ACB_ICON_STROKE}
          />
          İl / İlçe Bazlı
        </button>
        <button
          type="button"
          onClick={() => modDegistir("konum")}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            mod === "konum"
              ? "bg-white text-emerald-950 shadow-sm border border-slate-200/50"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Navigation
            className={`size-4 ${
              mod === "konum" ? "text-emerald-600" : "text-slate-400"
            }`}
            strokeWidth={ACB_ICON_STROKE}
          />
          Konum + Menzil
        </button>
      </div>

      {mod === "il_ilce" ? (
        <div className="space-y-3.5">
          {/* İl Kartları ve Şehir Yönetimi */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hizmet İlleriniz
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {seciliIlSayisi > 0 ? `${seciliIlSayisi} İl, ${seciliIlceToplam} İlçe` : "Henüz il eklenmedi"}
              </span>
            </div>

            {/* Şehir Listesi */}
            {seciliIllerListesi.length > 0 ? (
              <div className="space-y-3">
                {seciliIllerListesi.map((il) => {
                  const ilceler = bolgeler[il] ?? [];
                  const ilceCount = ilceler.length;
                  const isIst = il === ISTANBUL_IL;

                  return (
                    <div
                      key={il}
                      className="p-3.5 rounded-2xl bg-slate-50/90 space-y-3 transition-colors hover:bg-slate-100/70"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{il}</span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200/60">
                            {ilceCount > 0 ? `${ilceCount} İlçe Seçili` : "0 İlçe"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => ilSil(il)}
                          className="text-xs text-slate-400 hover:text-red-600 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition cursor-pointer"
                        >
                          Kaldır
                        </button>
                      </div>

                      {/* Seçili İlçelerin Kısa Özeti */}
                      {ilceCount > 0 ? (
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {ilceler.slice(0, 6).join(", ")}
                          {ilceCount > 6 ? ` ve +${ilceCount - 6} ilçe daha` : ""}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-700 font-medium">
                          ⚠️ Henüz ilçe seçmediniz. Lütfen ilçelerinizi belirleyin.
                        </p>
                      )}

                      {/* İstanbul Kısayolları (Varsa) */}
                      {isIst && (
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => istanbulKisayol("avrupa")}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 shadow-2xs transition cursor-pointer"
                          >
                            <span>🌍</span> Avrupa ({baslangic.istanbul.avrupa.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => istanbulKisayol("asya")}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 shadow-2xs transition cursor-pointer"
                          >
                            <span>🌏</span> Anadolu ({baslangic.istanbul.asya.length})
                          </button>
                        </div>
                      )}

                      {/* Ana Aksiyon Butonu - Standart ACB Btn */}
                      <Btn
                        variant="primary"
                        onClick={() => {
                          aktifIlDegistir(il);
                          setIlceSheetAcik(true);
                        }}
                        className="!min-h-[44px] !py-2.5 !text-xs !font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <MapPin className="size-4 shrink-0" strokeWidth={ACB_ICON_STROKE} />
                        <span>İlçeleri Düzenle ({ilceCount})</span>
                      </Btn>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 text-center space-y-1">
                <p className="text-xs text-slate-600">
                  Henüz hizmet verdiğiniz bir şehir eklemediniz.
                </p>
              </div>
            )}

            {/* Yeni İl Ekleme Satırı */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <select
                value={yeniIl}
                onChange={(e) => setYeniIl(e.target.value)}
                className="flex-1 rounded-xl bg-slate-100/90 border border-slate-200/80 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">Farklı bir il ekle…</option>
                {baslangic.tumIller
                  .filter((il) => !bolgeler[il] || bolgeler[il].length === 0)
                  .map((il) => (
                    <option key={il} value={il}>
                      {il}
                    </option>
                  ))}
              </select>
              <Btn
                variant="secondary"
                onClick={ilEkle}
                disabled={!yeniIl}
                className="!w-auto !min-h-[40px] !py-2 !px-4 !text-xs !font-bold shrink-0"
              >
                + İl Ekle
              </Btn>
            </div>
          </div>

          {/* İlçe Seçim Pop-up (Bottom Sheet Modal) */}
          <BottomSheet
            open={ilceSheetAcik}
            onClose={() => setIlceSheetAcik(false)}
            title={`${aktifIl} (${seciliIlceler.length} / ${tumIlceler.length} İlçe)`}
          >
            <div className="space-y-4 pb-2">
              {/* İstanbul Kısayolları (Sheet İçi) */}
              {aktifIl === ISTANBUL_IL && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => istanbulKisayol("avrupa")}
                    className="flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 font-semibold transition"
                  >
                    <span>🌍</span> Avrupa ({baslangic.istanbul.avrupa.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => istanbulKisayol("asya")}
                    className="flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 font-semibold transition"
                  >
                    <span>🌏</span> Anadolu ({baslangic.istanbul.asya.length})
                  </button>
                </div>
              )}

              {ilcelerYukleniyor ? (
                <p className="text-xs text-slate-500 text-center py-8">İlçeler yükleniyor…</p>
              ) : (
                <IlceSecimi
                  il={aktifIl}
                  tumIlceler={tumIlceler}
                  seciliIlceler={seciliIlceler}
                  onToggle={toggleIlce}
                  onTumunuSec={() => {
                    const next = {
                      ...bolgeler,
                      [aktifIl]: [...tumIlceler],
                    };
                    setBolgeler(next);
                    void otoKaydet(mod, next, menzilKm);
                  }}
                  onTemizle={() => {
                    const next = { ...bolgeler };
                    delete next[aktifIl];
                    setBolgeler(next);
                    void otoKaydet(mod, next, menzilKm);
                  }}
                />
              )}

              <div className="sticky bottom-0 z-20 pt-3 pb-1 bg-white border-t border-slate-100">
                <Btn
                  onClick={() => setIlceSheetAcik(false)}
                  className="w-full justify-center shadow-lg shadow-emerald-700/20 py-3 text-sm font-bold"
                >
                  Tamamla ({seciliIlceler.length} İlçe) ✓
                </Btn>
              </div>
            </div>
          </BottomSheet>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4 shadow-sm">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Navigation className="size-5 text-emerald-600 shrink-0 mt-0.5" strokeWidth={ACB_ICON_STROKE} />
            <div className="text-xs text-slate-600 leading-relaxed">
              Çekici paneliniz açıkken cihaz konumunuz <strong>dakikada bir</strong> güncellenir. Talepler seçtiğiniz menzil içindeyse size anında iletilir.
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-100">
            {baslangic.konumGuncel ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Son konum güncel {baslangic.konumGuncelleme && `(${new Date(baslangic.konumGuncelleme).toLocaleTimeString("tr-TR")})`}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-700">
                <span className="size-2 rounded-full bg-amber-500" />
                Henüz canlı konum alınmadı. Panele girip konum izni vermeniz yeterlidir.
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Hizmet Menzili</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-sm">
                {menzilKm} km
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={menzilKm}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMenzilKm(val);
                void otoKaydet(mod, bolgeler, val);
              }}
              className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>5 km</span>
              <span>50 km</span>
              <span>100 km</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
