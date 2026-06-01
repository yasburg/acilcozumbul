import { googleAcikHedefOnerileri } from "./google-places";
import {
  mesafeKmHaversine,
  SORUN_ARAMALARI,
  type HedefOneriSecenekleri,
  type KonumOneri,
} from "./hedef-oneri-data";

export type { HedefOneriSecenekleri, KonumOneri } from "./hedef-oneri-data";
export { SORUN_ARAMALARI } from "./hedef-oneri-data";

export type HedefOneriKaynak = "google" | "nominatim";

export interface HedefOneriSonuc {
  oneriler: KonumOneri[];
  kaynak: HedefOneriKaynak;
  /** Google Places openNow ile filtrelendi */
  acikFiltrelendi: boolean;
}

/** Nominatim (OpenStreetMap) — açık/kapalı bilgisi yok */
async function nominatimHedefOnerileri(
  lat: number,
  lng: number,
  sorunTipi: string,
  opts: HedefOneriSecenekleri = {}
): Promise<KonumOneri[]> {
  const limit = opts.limit ?? 3;
  const exclude = new Set(opts.excludeAdres ?? []);
  const aramalarBase = SORUN_ARAMALARI[sorunTipi] ?? SORUN_ARAMALARI.diger;
  const off =
    aramalarBase.length > 0
      ? ((opts.queryOffset ?? 0) % aramalarBase.length)
      : 0;
  const aramalar = [
    ...aramalarBase.slice(off),
    ...aramalarBase.slice(0, off),
  ];

  const oneriler: KonumOneri[] = [];
  const nominatimLimit = (opts.queryOffset ?? 0) > 0 ? 4 : 3;

  for (const q of aramalar) {
    if (oneriler.length >= limit + exclude.size) break;
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=${nominatimLimit}&viewbox=${lng - 0.15},${lat + 0.15},${lng + 0.15},${lat - 0.15}&bounded=1&accept-language=tr`;
      const res = await fetch(url, {
        headers: { "User-Agent": "acilcozumbul.com/1.0" },
      });
      const data = await res.json();
      if (!Array.isArray(data)) continue;

      for (const item of data) {
        const itemLat = parseFloat(item.lat);
        const itemLng = parseFloat(item.lon);
        if (Number.isNaN(itemLat)) continue;

        const adres = item.display_name as string;
        if (exclude.has(adres)) continue;

        oneriler.push({
          ad: item.name?.split(",")[0] ?? q,
          adres,
          lat: itemLat,
          lng: itemLng,
          mesafeKm:
            Math.round(mesafeKmHaversine(lat, lng, itemLat, itemLng) * 10) / 10,
        });
      }
    } catch {
      /* atla */
    }
  }

  const benzersiz = new Map<string, KonumOneri>();
  for (const o of oneriler.sort(
    (a, b) => (a.mesafeKm ?? 99) - (b.mesafeKm ?? 99)
  )) {
    if (!benzersiz.has(o.adres)) benzersiz.set(o.adres, o);
  }

  return Array.from(benzersiz.values()).slice(0, limit);
}

/** Önce Google (şu an açık), yoksa Nominatim yedek */
export async function hedefKonumOnerileri(
  lat: number,
  lng: number,
  sorunTipi = "diger",
  opts: HedefOneriSecenekleri = {}
): Promise<HedefOneriSonuc> {
  const google = await googleAcikHedefOnerileri(lat, lng, sorunTipi, opts);

  if (google.oneriler.length > 0) {
    return {
      oneriler: google.oneriler,
      kaynak: "google",
      acikFiltrelendi: true,
    };
  }

  const nominatim = await nominatimHedefOnerileri(lat, lng, sorunTipi, opts);
  return {
    oneriler: nominatim,
    kaynak: "nominatim",
    acikFiltrelendi: false,
  };
}
