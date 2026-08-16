"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Btn, Card, Spinner } from "@/components/ui";
import { HedefOneriHarita } from "@/components/HedefOneriHarita";
import type { KonumOneri } from "@/lib/hedef-oneri-data";
import { otoTamirAramaSorgusu } from "@/lib/hedef-oneri-data";
import { parseIlIlce } from "@/lib/konum-parse";
import type { HedefOneriKaynak } from "@/lib/konum-oneri";
import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";

type Konum = { lat: number; lng: number; adres: string };

interface BekleHedefDegistirProps {
  talepId: string;
  musteriKonum: Konum | null;
  hedefKonum: Konum | null;
  sorunTipi: string | null;
  degistirildi: boolean;
  onGuncellendi: (hedef: Konum) => void;
}

function puanSatiri(o: KonumOneri): string | null {
  if (o.puan == null) return null;
  const n = o.puanSayisi != null ? ` · ${o.puanSayisi} değerlendirme` : "";
  return `${o.puan}${n}`;
}

function OneriListe({
  baslik,
  renkSinif,
  pinSinif,
  liste,
  hedefKonum,
  onSec,
}: {
  baslik: string;
  renkSinif: string;
  pinSinif: string;
  liste: KonumOneri[];
  hedefKonum: Konum | null;
  onSec: (o: KonumOneri) => void;
}) {
  if (liste.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className={`text-xs font-semibold uppercase tracking-wide ${renkSinif}`}>
        {baslik} ({liste.length})
      </p>
      {liste.map((o, i) => {
        const seciliMi =
          hedefKonum &&
          Math.abs(hedefKonum.lat - o.lat) < 1e-5 &&
          Math.abs(hedefKonum.lng - o.lng) < 1e-5;
        const no = o.etiketNo ?? i + 1;
        const puan = puanSatiri(o);
        return (
          <button
            key={o.placeId ?? `${o.lat}-${o.lng}-${i}`}
            type="button"
            onClick={() => onSec(o)}
            className={`w-full text-left rounded-xl border bg-white px-3 py-2.5 transition ${
              seciliMi
                ? "border-amber-500 ring-1 ring-amber-200"
                : "border-slate-200 hover:border-amber-400"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-slate-900 min-w-0">
                <span
                  className={`inline-flex size-5 items-center justify-center rounded-full text-xs font-bold mr-2 ${pinSinif}`}
                >
                  {no}
                </span>
                {o.ad}
              </p>
              {puan && (
                <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-[var(--acb-dark)]">
                  <AcbIcons.rating
                    className="size-3"
                    strokeWidth={ACB_ICON_STROKE}
                    aria-hidden
                  />
                  {puan.split(" · ")[0]}
                </span>
              )}
            </div>
            <div className="pl-7 mt-0.5 space-y-0.5">
              {o.mesafeKm != null && (
                <p className="text-xs text-slate-600">~{o.mesafeKm} km</p>
              )}
              {puan && o.puanSayisi != null && (
                <p className="text-xs text-slate-500">
                  {o.puanSayisi} değerlendirme
                </p>
              )}
              <p className="text-xs text-slate-500 line-clamp-2">{o.adres}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function BekleHedefDegistir({
  talepId,
  musteriKonum,
  hedefKonum,
  sorunTipi: _sorunTipi,
  degistirildi,
  onGuncellendi,
}: BekleHedefDegistirProps) {
  const [oneriler, setOneriler] = useState<KonumOneri[]>([]);
  const [kaynak, setKaynak] = useState<HedefOneriKaynak | null>(null);
  const [semt, setSemt] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [onayOneri, setOnayOneri] = useState<KonumOneri | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const tamirler = useMemo(
    () => oneriler.filter((o) => o.kategori === "oto_tamir"),
    [oneriler]
  );
  const sanayiler = useMemo(
    () => oneriler.filter((o) => o.kategori === "oto_sanayi"),
    [oneriler]
  );

  const yukle = useCallback(async () => {
    const lat = musteriKonum?.lat;
    const lng = musteriKonum?.lng;
    const adres = musteriKonum?.adres?.trim() ?? "";
    if (lat == null || lng == null) {
      setHata("Arıza konumu yok; yakın servisler listelenemiyor.");
      return;
    }
    setYukleniyor(true);
    setHata("");
    try {
      const res = await fetch(
        `/api/konum/oneri?lat=${lat}&lng=${lng}&mod=servis${
          adres ? `&adres=${encodeURIComponent(adres)}` : ""
        }`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Öneriler alınamadı.");
      setOneriler(data.oneriler ?? []);
      setKaynak(data.kaynak ?? null);
      setSemt(
        typeof data.semt === "string" && data.semt.trim()
          ? data.semt.trim()
          : null
      );
      if (!(data.oneriler ?? []).length) {
        setHata("Yakın servis bulunamadı. Daha sonra tekrar deneyin.");
      }
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Öneriler alınamadı.");
    } finally {
      setYukleniyor(false);
    }
  }, [musteriKonum?.lat, musteriKonum?.lng, musteriKonum?.adres]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  async function onayla() {
    if (!onayOneri || degistirildi) return;
    setKaydediliyor(true);
    setHata("");
    try {
      const res = await fetch(`/api/talep/${talepId}/hedef`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          hedefKonum: {
            lat: onayOneri.lat,
            lng: onayOneri.lng,
            adres: onayOneri.adres,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Güncellenemedi.");
      onGuncellendi({
        lat: onayOneri.lat,
        lng: onayOneri.lng,
        adres: onayOneri.adres,
      });
      setOnayOneri(null);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Güncellenemedi.");
      setOnayOneri(null);
    } finally {
      setKaydediliyor(false);
    }
  }

  return (
    <div className="w-full text-left space-y-4 mt-6">
      <Card className="bg-amber-50 border-amber-200 !py-3">
        <p className="text-sm text-amber-950 leading-relaxed">
          {degistirildi
            ? "Hedef servis güncellendi. Bu talep için bir daha değiştiremezsiniz."
            : "Beklerken gideceğiniz servisi değiştirebilirsiniz. Yalnızca bir kez değişiklik yapabilirsiniz."}
        </p>
      </Card>

      {hedefKonum && (
        <Card className="bg-emerald-50 border-emerald-200">
          <p className="text-xs text-emerald-700 uppercase tracking-wide mb-1">
            Seçili hedef
          </p>
          <p className="text-sm text-emerald-900 leading-relaxed">
            {hedefKonum.adres}
          </p>
        </Card>
      )}

      {!degistirildi && (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Yakın servisler
              {kaynak === "google" ? " (Google)" : kaynak ? " (harita)" : ""}
            </p>
            <button
              type="button"
              onClick={() => void yukle()}
              disabled={yukleniyor}
              className="text-xs font-medium text-amber-700 underline disabled:opacity-50"
            >
              Yenilerini ara
            </button>
          </div>

          {yukleniyor && oneriler.length === 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Spinner />
              <p className="text-sm text-slate-600">
                Oto tamir ve oto sanayi aranıyor…
              </p>
            </div>
          )}

          {oneriler.length > 0 && (
            <>
              <HedefOneriHarita
                oneriler={oneriler}
                ariza={
                  musteriKonum
                    ? { lat: musteriKonum.lat, lng: musteriKonum.lng }
                    : null
                }
                secili={
                  hedefKonum
                    ? { lat: hedefKonum.lat, lng: hedefKonum.lng }
                    : null
                }
                onSec={(o) => setOnayOneri(o)}
                mapsArama={otoTamirAramaSorgusu({
                  semt,
                  il: musteriKonum?.adres
                    ? parseIlIlce(musteriKonum.adres).il
                    : null,
                })}
              />
              <div className="space-y-4 max-h-80 overflow-y-auto">
                <OneriListe
                  baslik={
                    semt
                      ? `Semtinizdeki oto tamirler (${semt})`
                      : "Semtinizdeki oto tamirler"
                  }
                  renkSinif="text-blue-700"
                  pinSinif="bg-blue-100 text-blue-800"
                  liste={tamirler}
                  hedefKonum={hedefKonum}
                  onSec={setOnayOneri}
                />
                <OneriListe
                  baslik="Oto sanayi"
                  renkSinif="text-emerald-700"
                  pinSinif="bg-emerald-100 text-emerald-800"
                  liste={sanayiler}
                  hedefKonum={hedefKonum}
                  onSec={setOnayOneri}
                />
              </div>
            </>
          )}
        </>
      )}

      {hata && (
        <p className="text-sm text-red-600" role="alert">
          {hata}
        </p>
      )}

      {onayOneri && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hedef-onay-baslik"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl space-y-4">
            <h3
              id="hedef-onay-baslik"
              className="text-lg font-bold text-slate-900"
            >
              Değiştirmek istediğinize emin misiniz?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Hedef servis{" "}
              <strong className="text-slate-900">{onayOneri.ad}</strong>
              {onayOneri.puan != null && <> ({onayOneri.puan} puan)</>}{" "}
              olarak güncellenecek. Bu işlemi yalnızca bir kez yapabilirsiniz;
              bir daha değiştiremezsiniz.
            </p>
            <p className="text-xs text-slate-500 line-clamp-2">
              {onayOneri.adres}
            </p>
            <div className="flex gap-3">
              <Btn
                variant="outline"
                onClick={() => setOnayOneri(null)}
                disabled={kaydediliyor}
              >
                Vazgeç
              </Btn>
              <Btn onClick={() => void onayla()} disabled={kaydediliyor}>
                {kaydediliyor ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="size-4 border-white/40 border-t-white" />
                    Kaydediliyor…
                  </span>
                ) : (
                  "Evet, değiştir"
                )}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
