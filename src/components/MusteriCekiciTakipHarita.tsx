"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui";
import type { LatLng } from "@/lib/koordinat";
import { haritaSecenekleri } from "@/lib/harita-yonlendirme";

interface TakipVerisi {
  konum: LatLng | null;
  guncelleme: string | null;
  taze: boolean;
  etaDk: number | null;
  cekiciAd: string | null;
}

interface MusteriCekiciTakipHaritaProps {
  talepId: string;
  musteriKonum: LatLng;
  hedefKonum?: LatLng | null;
}

export function MusteriCekiciTakipHarita({
  talepId,
  musteriKonum,
  hedefKonum,
}: MusteriCekiciTakipHaritaProps) {
  const [veri, setVeri] = useState<TakipVerisi | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [haritaSecim, setHaritaSecim] = useState(false);
  const musteriRef = useRef(musteriKonum);
  musteriRef.current = musteriKonum;

  const yukle = useCallback(async () => {
    try {
      const res = await fetch(`/api/talep/${talepId}/cekici-konum`);
      if (res.ok) {
        setVeri(await res.json());
      }
    } catch {
      /* sessiz */
    } finally {
      setYukleniyor(false);
    }
  }, [talepId]);

  useEffect(() => {
    void yukle();
    const id = setInterval(yukle, 30_000);
    return () => clearInterval(id);
  }, [yukle]);

  const cekiciKonum = veri?.konum ?? null;
  const haritaSecenek = cekiciKonum
    ? haritaSecenekleri(musteriKonum, {
        cekici: cekiciKonum,
        hedef: hedefKonum,
      })
    : [];

  return (
    <Card className="border-emerald-200 bg-emerald-50/40 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
            Canlı takip
          </p>
          {veri?.cekiciAd && (
            <p className="text-sm font-medium text-slate-900 mt-0.5">
              {veri.cekiciAd} yolda
            </p>
          )}
        </div>
        {veri?.etaDk != null && (
          <span className="rounded-lg bg-emerald-600 text-white text-sm font-bold px-3 py-1.5 shrink-0">
            ~{veri.etaDk} dk
          </span>
        )}
      </div>

      {yukleniyor && !veri && (
        <p className="text-xs text-slate-500">Konum bilgisi alınıyor…</p>
      )}

      {!yukleniyor && !cekiciKonum && (
        <p className="text-xs text-slate-600 leading-relaxed">
          Çekici konumu henüz paylaşılmadı. Yola çıktığında burada görünecek.
        </p>
      )}

      {cekiciKonum && (
        <>
          <p className="text-xs text-slate-600">
            {veri?.taze
              ? "Konum güncel"
              : veri?.guncelleme
                ? `Son güncelleme: ${new Date(veri.guncelleme).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`
                : "Konum paylaşıldı"}
          </p>

          <button
            type="button"
            onClick={() => setHaritaSecim(true)}
            className="w-full rounded-xl border-2 border-emerald-200 bg-white px-4 py-3 text-left transition hover:border-emerald-300 active:scale-[0.99]"
          >
            <span className="text-sm font-semibold text-emerald-900 block">
              📍 Rotayı haritada aç
            </span>
            <span className="text-xs text-emerald-700 mt-0.5 block">
              Çekici → sizin konumunuz
              {hedefKonum ? " → hedef" : ""} · Google veya Apple Maps
            </span>
          </button>
        </>
      )}

      {haritaSecim && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 safe-bottom"
          role="dialog"
          aria-modal="true"
          aria-label="Harita uygulaması seçin"
          onClick={() => setHaritaSecim(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="font-semibold text-slate-900">Rotayı haritada aç</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Navigasyon uygulamanızı seçin
              </p>
            </div>
            <div className="p-2 flex flex-col gap-1">
              {haritaSecenek.map((sec) => (
                <a
                  key={sec.id}
                  href={sec.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setHaritaSecim(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-800 hover:bg-slate-50 active:bg-slate-100 transition"
                >
                  <span className="text-xl" aria-hidden>
                    {sec.id === "apple" ? "🍎" : "🗺️"}
                  </span>
                  {sec.label}
                </a>
              ))}
            </div>
            <div className="p-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setHaritaSecim(false)}
                className="w-full rounded-xl py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
