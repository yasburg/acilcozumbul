"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui";
import type { LatLng } from "@/lib/koordinat";
import { haritaSecenekleri } from "@/lib/harita-yonlendirme";

type LeafletNS = typeof import("leaflet");

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

function noktaIkon(
  L: LeafletNS,
  etiket: string,
  arka: string
) {
  return L.divIcon({
    className: "acil-takip-pin",
    html: `<span style="
      display:flex;align-items:center;justify-content:center;
      width:30px;height:30px;border-radius:9999px;
      background:${arka};color:#fff;font-weight:700;font-size:11px;
      box-shadow:0 2px 8px rgba(0,0,0,.28);border:2px solid #fff;
      font-family:system-ui,sans-serif;
    ">${etiket}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
}

export function MusteriCekiciTakipHarita({
  talepId,
  musteriKonum,
  hedefKonum,
}: MusteriCekiciTakipHaritaProps) {
  const [veri, setVeri] = useState<TakipVerisi | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [haritaSecim, setHaritaSecim] = useState(false);
  const haritaElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const LRef = useRef<LeafletNS | null>(null);
  const markersRef = useRef<{
    musteri?: import("leaflet").Marker;
    cekici?: import("leaflet").Marker;
    hedef?: import("leaflet").Marker;
  }>({});

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
    const id = setInterval(yukle, 15_000);
    return () => clearInterval(id);
  }, [yukle]);

  const cekiciKonum = veri?.konum ?? null;

  /* Harita kur + noktaları güncelle */
  useEffect(() => {
    const el = haritaElRef.current;
    if (!el) return;

    let iptal = false;

    void (async () => {
      if (!LRef.current) {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");
        if (iptal) return;
        LRef.current = L;
      }
      const L = LRef.current;
      if (!L || iptal) return;

      if (!mapRef.current) {
        const map = L.map(el, {
          scrollWheelZoom: false,
          attributionControl: false,
          zoomControl: true,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(map);
        mapRef.current = map;
      }

      const map = mapRef.current;
      const markers = markersRef.current;
      const bounds = L.latLngBounds([]);

      if (!markers.musteri) {
        markers.musteri = L.marker([musteriKonum.lat, musteriKonum.lng], {
          icon: noktaIkon(L, "Siz", "#1e293b"),
          zIndexOffset: 200,
        }).addTo(map);
        markers.musteri.bindTooltip("Sizin konumunuz", {
          direction: "top",
          offset: [0, -12],
        });
      } else {
        markers.musteri.setLatLng([musteriKonum.lat, musteriKonum.lng]);
      }
      bounds.extend([musteriKonum.lat, musteriKonum.lng]);

      if (cekiciKonum) {
        if (!markers.cekici) {
          markers.cekici = L.marker([cekiciKonum.lat, cekiciKonum.lng], {
            icon: noktaIkon(L, "🚛", "#059669"),
            zIndexOffset: 300,
          }).addTo(map);
          markers.cekici.bindTooltip(veri?.cekiciAd ?? "Çekici", {
            direction: "top",
            offset: [0, -12],
          });
        } else {
          markers.cekici.setLatLng([cekiciKonum.lat, cekiciKonum.lng]);
          if (veri?.cekiciAd) {
            markers.cekici.setTooltipContent(veri.cekiciAd);
          }
        }
        bounds.extend([cekiciKonum.lat, cekiciKonum.lng]);
      } else if (markers.cekici) {
        map.removeLayer(markers.cekici);
        markers.cekici = undefined;
      }

      if (hedefKonum) {
        if (!markers.hedef) {
          markers.hedef = L.marker([hedefKonum.lat, hedefKonum.lng], {
            icon: noktaIkon(L, "🎯", "#d97706"),
            zIndexOffset: 150,
          }).addTo(map);
          markers.hedef.bindTooltip("Hedef", {
            direction: "top",
            offset: [0, -12],
          });
        } else {
          markers.hedef.setLatLng([hedefKonum.lat, hedefKonum.lng]);
        }
        bounds.extend([hedefKonum.lat, hedefKonum.lng]);
      } else if (markers.hedef) {
        map.removeLayer(markers.hedef);
        markers.hedef = undefined;
      }

      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.28), { maxZoom: 15, animate: true });
      }

      requestAnimationFrame(() => map.invalidateSize());
    })();

    return () => {
      iptal = true;
    };
  }, [
    musteriKonum.lat,
    musteriKonum.lng,
    cekiciKonum?.lat,
    cekiciKonum?.lng,
    hedefKonum?.lat,
    hedefKonum?.lng,
    veri?.cekiciAd,
  ]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
      LRef.current = null;
    };
  }, []);

  const haritaSecenek = cekiciKonum
    ? haritaSecenekleri(musteriKonum, {
        cekici: cekiciKonum,
        hedef: hedefKonum,
      })
    : [];

  return (
    <Card className="border-emerald-200 bg-emerald-50/40 space-y-3 overflow-hidden">
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

      <div
        ref={haritaElRef}
        className="h-56 w-full rounded-xl overflow-hidden border border-emerald-100 bg-slate-100 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.acil-takip-pin]:border-0 [&_.acil-takip-pin]:bg-transparent"
        role="img"
        aria-label="Çekici canlı konum haritası"
      />

      {yukleniyor && !veri && (
        <p className="text-xs text-slate-500">Konum bilgisi alınıyor…</p>
      )}

      {!yukleniyor && !cekiciKonum && (
        <p className="text-xs text-slate-600 leading-relaxed">
          Çekici konumu henüz paylaşılmadı. Yola çıktığında haritada görünecek.
        </p>
      )}

      {cekiciKonum && (
        <>
          <p className="text-xs text-slate-600">
            {veri?.taze
              ? "Konum güncel · harita ~15 sn’de bir yenilenir"
              : veri?.guncelleme
                ? `Son güncelleme: ${new Date(veri.guncelleme).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`
                : "Konum paylaşıldı"}
          </p>

          <button
            type="button"
            onClick={() => setHaritaSecim(true)}
            className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-left transition hover:border-emerald-300 active:scale-[0.99]"
          >
            <span className="text-sm font-semibold text-emerald-900 block">
              Rotayı haritada aç
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
