"use client";

import { useEffect, useRef } from "react";
import type { KonumOneri } from "@/lib/hedef-oneri-data";

type Nokta = { lat: number; lng: number };
type LeafletNS = typeof import("leaflet");

const KATEGORI_RENK = {
  oto_tamir: { bg: "#2563eb", ring: "#93c5fd", label: "Oto Tamir" },
  oto_sanayi: { bg: "#059669", ring: "#6ee7b7", label: "Oto sanayi" },
  varsayilan: { bg: "#f59e0b", ring: "#fde68a", label: "Öneri" },
} as const;

/** ~25 m — bu mesafeden yakın pinler ayrılır */
const YAKIN_ESIK_KM = 0.04;
/** Ayırma yarıçapı (~35 m) */
const AYIRMA_KM = 0.035;

/**
 * Rota değil — Maps arama listesi (sol panelde sonuçlar).
 * Örn. oto tamir Gaziosmanpaşa İstanbul @arıza konumu
 */
function googleMapsUrl(
  oneriler: KonumOneri[],
  ariza?: Nokta | null,
  aramaSorgusu?: string | null
): string {
  const q =
    aramaSorgusu?.trim() ||
    (oneriler.some((o) => o.kategori === "oto_tamir")
      ? "oto tamir"
      : oneriler.some((o) => o.kategori === "oto_sanayi")
        ? "oto sanayi"
        : "oto servis");

  const merkez =
    ariza && Number.isFinite(ariza.lat) && Number.isFinite(ariza.lng)
      ? ariza
      : oneriler[0] && Number.isFinite(oneriler[0].lat)
        ? { lat: oneriler[0].lat, lng: oneriler[0].lng }
        : null;

  if (merkez) {
    return `https://www.google.com/maps/search/${encodeURIComponent(q)}/@${merkez.lat},${merkez.lng},14z?hl=tr`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}&hl=tr`;
}

function ayniNokta(a?: Nokta | null, b?: Nokta | null): boolean {
  if (!a || !b) return false;
  return Math.abs(a.lat - b.lat) < 1e-5 && Math.abs(a.lng - b.lng) < 1e-5;
}

function noktaImza(n?: Nokta | null): string {
  if (!n || !Number.isFinite(n.lat) || !Number.isFinite(n.lng)) return "";
  return `${n.lat.toFixed(5)},${n.lng.toFixed(5)}`;
}

/** Aynı içerik için yeni dizi referansı haritayı yeniden kurmasın */
function oneriImza(oneriler: KonumOneri[]): string {
  return oneriler
    .map((o) =>
      [
        o.placeId ?? "",
        Number.isFinite(o.lat) ? o.lat.toFixed(5) : "",
        Number.isFinite(o.lng) ? o.lng.toFixed(5) : "",
        o.etiketNo ?? "",
        o.kategori ?? "",
        o.puan ?? "",
        o.puanSayisi ?? "",
        o.ad,
      ].join(":")
    )
    .join("|");
}

function kategoriRenk(kategori?: KonumOneri["kategori"]) {
  if (kategori === "oto_tamir") return KATEGORI_RENK.oto_tamir;
  if (kategori === "oto_sanayi") return KATEGORI_RENK.oto_sanayi;
  return KATEGORI_RENK.varsayilan;
}

function puanMetin(o: KonumOneri): string {
  if (o.puan == null) return "";
  const n = o.puanSayisi != null ? ` (${o.puanSayisi})` : "";
  return ` ★ ${o.puan}${n}`;
}

function mesafeKm(a: Nokta, b: Nokta): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

/**
 * Yakın pinleri daire üzerinde yayarak üst üste binmeyi azaltır.
 * Dönüş: görüntüleme koordinatı + puanın sağ/sol yerleşimi.
 */
function pinYerlesimleri(
  oneriler: KonumOneri[]
): Array<{ lat: number; lng: number; puanSag: boolean }> {
  const n = oneriler.length;
  const used = new Array(n).fill(false);
  const out = oneriler.map((o) => ({
    lat: o.lat,
    lng: o.lng,
    puanSag: true,
  }));

  for (let i = 0; i < n; i++) {
    if (used[i]) continue;
    const kume = [i];
    used[i] = true;
    for (let j = i + 1; j < n; j++) {
      if (used[j]) continue;
      if (
        mesafeKm(
          { lat: oneriler[i].lat, lng: oneriler[i].lng },
          { lat: oneriler[j].lat, lng: oneriler[j].lng }
        ) <= YAKIN_ESIK_KM
      ) {
        kume.push(j);
        used[j] = true;
      }
    }

    if (kume.length === 1) {
      out[i].puanSag = (oneriler[i].etiketNo ?? i + 1) % 2 === 1;
      continue;
    }

    const cLat =
      kume.reduce((s, idx) => s + oneriler[idx].lat, 0) / kume.length;
    const cLng =
      kume.reduce((s, idx) => s + oneriler[idx].lng, 0) / kume.length;
    /* km → derece (yaklaşık) */
    const dLat = AYIRMA_KM / 111;
    const dLng = AYIRMA_KM / (111 * Math.cos((cLat * Math.PI) / 180) || 1);

    kume.forEach((idx, k) => {
      const angle = (2 * Math.PI * k) / kume.length - Math.PI / 2;
      out[idx] = {
        lat: cLat + dLat * Math.sin(angle),
        lng: cLng + dLng * Math.cos(angle),
        /* Açının sağ/sol yarısına göre puan yönü */
        puanSag: Math.cos(angle) >= 0,
      };
    });
  }

  return out;
}

function numaraIkon(
  L: LeafletNS,
  no: number | string,
  kategori: KonumOneri["kategori"] | undefined,
  secili: boolean,
  puan?: number | null,
  puanSag = true
) {
  const renk = kategoriRenk(kategori);
  const bg = renk.bg;
  const fg = "#fff";
  const ring = secili ? "#fff" : renk.ring;
  const shadow = secili
    ? "0 0 0 3px rgba(0,0,0,.15), 0 2px 8px rgba(0,0,0,.35)"
    : "0 2px 6px rgba(0,0,0,.25)";

  const noHtml = `<span style="
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
      width:28px;height:28px;border-radius:9999px;
      background:${bg};color:${fg};font-weight:700;font-size:12px;
      box-shadow:${shadow};border:2px solid ${ring};
      font-family:system-ui,sans-serif;
    ">${no}</span>`;

  const puanHtml =
    puan != null && Number.isFinite(puan)
      ? `<span style="
          display:inline-flex;align-items:center;gap:1px;flex-shrink:0;
          height:22px;padding:0 6px;border-radius:9999px;
          background:#fff;color:#92400e;font-weight:700;font-size:10px;
          box-shadow:0 1px 4px rgba(0,0,0,.2);border:1px solid #fcd34d;
          font-family:system-ui,sans-serif;white-space:nowrap;
          line-height:1;
        "><span style="color:#f59e0b;font-size:11px">★</span>${puan.toFixed(1)}</span>`
      : "";

  const ic = puanHtml
    ? puanSag
      ? `${noHtml}${puanHtml}`
      : `${puanHtml}${noHtml}`
    : noHtml;

  const genislik = puanHtml ? 78 : 28;
  const yukseklik = 28;

  return L.divIcon({
    className: "acil-harita-pin",
    html: `<span style="
      display:inline-flex;align-items:center;gap:3px;
      width:${genislik}px;height:${yukseklik}px;
      pointer-events:auto;
    ">${ic}</span>`,
    iconSize: [genislik, yukseklik],
    iconAnchor: [puanSag || !puanHtml ? 14 : genislik - 14, yukseklik],
    popupAnchor: [0, -yukseklik],
  });
}

function arizaIkon(L: LeafletNS) {
  return L.divIcon({
    className: "acil-harita-pin",
    html: `<span style="
      display:flex;align-items:center;justify-content:center;
      width:28px;height:28px;border-radius:9999px;
      background:#1e293b;color:#fff;font-weight:700;font-size:11px;
      box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid #fff;
      font-family:system-ui,sans-serif;
    ">A</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

export function HedefOneriHarita({
  oneriler,
  ariza,
  secili,
  onSec,
  mapsArama,
}: {
  oneriler: KonumOneri[];
  ariza?: Nokta | null;
  secili?: Nokta | null;
  onSec: (o: KonumOneri) => void;
  /** Google Maps’te aç — arama listesi sorgusu (rota değil) */
  mapsArama?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const onSecRef = useRef(onSec);
  onSecRef.current = onSec;
  const onerilerRef = useRef(oneriler);
  onerilerRef.current = oneriler;
  const arizaRef = useRef(ariza);
  arizaRef.current = ariza;
  const seciliRef = useRef(secili);
  seciliRef.current = secili;

  const gruplu = oneriler.some((o) => o.kategori);
  const oneriKey = oneriImza(oneriler);
  const arizaKey = noktaImza(ariza);
  const seciliKey = noktaImza(secili);

  useEffect(() => {
    const el = containerRef.current;
    const liste = onerilerRef.current;
    const arizaNokta = arizaRef.current;
    const seciliNokta = seciliRef.current;
    if (!el || liste.length === 0) return;

    let iptal = false;
    let map: import("leaflet").Map | null = null;

    void (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (iptal || !containerRef.current) return;

      map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        attributionControl: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      const bounds = L.latLngBounds([]);
      const yerler = pinYerlesimleri(liste);

      if (
        arizaNokta &&
        Number.isFinite(arizaNokta.lat) &&
        Number.isFinite(arizaNokta.lng)
      ) {
        const m = L.marker([arizaNokta.lat, arizaNokta.lng], {
          icon: arizaIkon(L),
          interactive: false,
          zIndexOffset: 200,
        }).addTo(map);
        m.bindTooltip("Arıza konumu", { direction: "top", offset: [0, -12] });
        bounds.extend([arizaNokta.lat, arizaNokta.lng]);
      }

      liste.forEach((o, i) => {
        if (!map || !Number.isFinite(o.lat) || !Number.isFinite(o.lng)) return;
        const yer = yerler[i];
        const seciliMi = ayniNokta(seciliNokta, o);
        const no = o.etiketNo ?? i + 1;
        const marker = L.marker([yer.lat, yer.lng], {
          icon: numaraIkon(
            L,
            no,
            o.kategori,
            seciliMi,
            o.puan,
            yer.puanSag
          ),
          zIndexOffset: seciliMi ? 400 : 100 + no,
        }).addTo(map);
        const kat = kategoriRenk(o.kategori).label;
        marker.bindTooltip(
          `${no}. ${o.ad}${puanMetin(o)}${o.kategori ? ` · ${kat}` : ""}`,
          { direction: "top", offset: [0, -14], opacity: 0.95 }
        );
        marker.on("click", () => onSecRef.current(o));
        bounds.extend([yer.lat, yer.lng]);
      });

      if (
        arizaNokta &&
        Number.isFinite(arizaNokta.lat) &&
        Number.isFinite(arizaNokta.lng)
      ) {
        let zoom = 14;
        if (liste.length > 0) {
          const maxKm = Math.max(
            ...liste.map((o) =>
              Number.isFinite(o.mesafeKm) ? (o.mesafeKm as number) : 0
            ),
            0
          );
          if (maxKm > 8) zoom = 12;
          else if (maxKm > 4) zoom = 13;
          else if (maxKm > 2) zoom = 13;
          else zoom = 14;
        }
        map.setView([arizaNokta.lat, arizaNokta.lng], zoom, { animate: false });
      } else if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.2), { maxZoom: 14, animate: false });
      }

      requestAnimationFrame(() => map?.invalidateSize());
      window.setTimeout(() => map?.invalidateSize(), 150);
    })();

    return () => {
      iptal = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [oneriKey, arizaKey, seciliKey]);

  if (oneriler.length === 0) return null;

  const disLink = googleMapsUrl(oneriler, ariza, mapsArama);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          Haritada öneriler
        </p>
        <a
          href={disLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-amber-700 underline"
        >
          Google Maps’te aç
        </a>
      </div>
      {gruplu && (
        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-600" />
            Semtinizdeki oto tamirler
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-600" />
            Oto sanayi
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-slate-800" />
            Arıza (A)
          </span>
        </div>
      )}
      <div className="relative z-0 isolate overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-[4/3] sm:aspect-[16/10]">
        <div ref={containerRef} className="h-full w-full [&_.leaflet-container]:!z-0" />
      </div>
      <p className="text-xs text-slate-500 text-center">
        Numaraya dokunarak hedef seçin. A = arıza konumu.
        {" · "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-slate-300 hover:text-slate-700"
        >
          © OpenStreetMap
        </a>
      </p>
      <style>{`
        .acil-harita-pin {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          font: inherit;
          z-index: 0;
        }
      `}</style>
    </div>
  );
}
