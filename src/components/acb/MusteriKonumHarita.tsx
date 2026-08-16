"use client";

import { useEffect, useRef } from "react";
import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";

type LeafletNS = typeof import("leaflet");

/**
 * Compact customer-location map for live bidding.
 * Supports the experience — does not dominate the viewport.
 */
export function MusteriKonumHarita({
  lat,
  lng,
  className = "",
  heightClass = "h-44 sm:h-52",
}: {
  lat: number;
  lng: number;
  className?: string;
  heightClass?: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!elRef.current) return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    let iptal = false;

    void (async () => {
      const L = (await import("leaflet")) as LeafletNS;
      await import("leaflet/dist/leaflet.css");
      if (iptal || !elRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(elRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
      }).setView([lat, lng], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      const ikon = L.divIcon({
        className: "acb-konum-pin",
        html: `<span style="
          display:flex;align-items:center;justify-content:center;
          width:34px;height:34px;border-radius:9999px;
          background:#089b2d;color:#fff;font-weight:700;font-size:14px;
          box-shadow:0 2px 10px rgba(8,155,45,.4);border:2px solid #fff;
        "><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      L.marker([lat, lng], { icon: ikon }).addTo(map);
      mapRef.current = map;

      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    })();

    return () => {
      iptal = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng]);

  return (
    <div
      className={`relative overflow-hidden rounded-[var(--acb-radius)] border border-[var(--acb-border)] bg-[var(--acb-soft)] ${heightClass} ${className}`}
      aria-label="Konumunuz haritada"
    >
      <div ref={elRef} className="absolute inset-0 z-0" />
      <div className="pointer-events-none absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-[var(--acb-radius-sm)] bg-white/95 px-2.5 py-1 text-xs font-semibold text-[var(--acb-dark)] shadow-[var(--acb-shadow)]">
        <AcbIcons.location
          className="size-3.5 text-[var(--acb-green)]"
          strokeWidth={ACB_ICON_STROKE}
          aria-hidden
        />
        Konumunuz
      </div>
    </div>
  );
}
