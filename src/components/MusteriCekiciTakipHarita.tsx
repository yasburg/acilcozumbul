"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui";
import { latLngStr, type LatLng } from "@/lib/koordinat";

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

function embedDirectionsUrl(
  cekici: LatLng,
  musteri: LatLng,
  hedef?: LatLng | null,
  apiKey?: string
): string | null {
  if (!apiKey) return null;
  const params = new URLSearchParams({
    key: apiKey,
    origin: latLngStr(cekici),
    destination: latLngStr(hedef ?? musteri),
    mode: "driving",
  });
  if (hedef) {
    params.set("waypoints", latLngStr(musteri));
  }
  return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
}

function googleMapsDirUrl(
  cekici: LatLng,
  musteri: LatLng,
  hedef?: LatLng | null
): string {
  const params = new URLSearchParams({
    api: "1",
    origin: latLngStr(cekici),
    destination: latLngStr(hedef ?? musteri),
    travelmode: "driving",
  });
  if (hedef) params.set("waypoints", latLngStr(musteri));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function MusteriCekiciTakipHarita({
  talepId,
  musteriKonum,
  hedefKonum,
}: MusteriCekiciTakipHaritaProps) {
  const [veri, setVeri] = useState<TakipVerisi | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [haritaAcik, setHaritaAcik] = useState(true);
  const musteriRef = useRef(musteriKonum);
  musteriRef.current = musteriKonum;

  const embedKey =
    typeof process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === "string"
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim()
      : "";

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
  const embedUrl =
    cekiciKonum && embedKey
      ? embedDirectionsUrl(cekiciKonum, musteriKonum, hedefKonum, embedKey)
      : null;

  const disLink = cekiciKonum
    ? googleMapsDirUrl(cekiciKonum, musteriKonum, hedefKonum)
    : null;

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

          {embedUrl && (
            <>
              <button
                type="button"
                onClick={() => setHaritaAcik((a) => !a)}
                className="text-xs font-medium text-emerald-800 underline"
              >
                {haritaAcik ? "Haritayı gizle" : "Haritayı göster"}
              </button>
              {haritaAcik && (
                <div className="rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-100">
                  <iframe
                    title="Çekici canlı konum"
                    src={embedUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              )}
            </>
          )}

          {disLink && (
            <a
              href={disLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm font-semibold text-emerald-700 underline"
            >
              Google Maps&apos;te aç
            </a>
          )}
        </>
      )}
    </Card>
  );
}
