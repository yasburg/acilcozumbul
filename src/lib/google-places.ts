import { googleMapsApiKey } from "./google-maps";
import {
  mesafeKmHaversine,
  SORUN_ARAMALARI,
  type HedefOneriSecenekleri,
  type KonumOneri,
} from "./hedef-oneri-data";

type GooglePlaceRow = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  businessStatus?: string;
};

/** Google Places (New) — text search, şu an açık işletmeler */
export async function googleAcikHedefOnerileri(
  lat: number,
  lng: number,
  sorunTipi: string,
  opts: HedefOneriSecenekleri = {}
): Promise<{ oneriler: KonumOneri[]; hata?: string }> {
  const key = googleMapsApiKey();
  if (!key) {
    return { oneriler: [], hata: "Google API anahtarı yok" };
  }

  const limit = opts.limit ?? 3;
  const excludeIds = new Set(opts.excludePlaceIds ?? []);
  const excludeAdres = new Set(opts.excludeAdres ?? []);
  const aramalarBase = SORUN_ARAMALARI[sorunTipi] ?? SORUN_ARAMALARI.diger;
  const off =
    aramalarBase.length > 0
      ? ((opts.queryOffset ?? 0) % aramalarBase.length)
      : 0;
  const aramalar = [
    ...aramalarBase.slice(off),
    ...aramalarBase.slice(0, off),
  ];

  const adaylar: KonumOneri[] = [];

  for (const textQuery of aramalar) {
    if (adaylar.length >= limit + excludeIds.size + excludeAdres.size) break;

    const places = await placesTextSearch(lat, lng, textQuery, key);
    for (const p of places) {
      const placeId = p.id;
      const itemLat = p.location?.latitude;
      const itemLng = p.location?.longitude;
      if (itemLat == null || itemLng == null) continue;
      if (p.businessStatus && p.businessStatus !== "OPERATIONAL") continue;

      const adres = p.formattedAddress ?? "";
      if (!adres) continue;
      if (placeId && excludeIds.has(placeId)) continue;
      if (excludeAdres.has(adres)) continue;

      adaylar.push({
        ad: p.displayName?.text ?? textQuery,
        adres,
        lat: itemLat,
        lng: itemLng,
        mesafeKm:
          Math.round(mesafeKmHaversine(lat, lng, itemLat, itemLng) * 10) / 10,
        placeId,
      });
    }
  }

  const benzersiz = new Map<string, KonumOneri>();
  for (const o of adaylar.sort(
    (a, b) => (a.mesafeKm ?? 99) - (b.mesafeKm ?? 99)
  )) {
    const anahtar = o.placeId ?? o.adres;
    if (!benzersiz.has(anahtar)) benzersiz.set(anahtar, o);
  }

  return { oneriler: Array.from(benzersiz.values()).slice(0, limit) };
}

async function placesTextSearch(
  lat: number,
  lng: number,
  textQuery: string,
  key: string
): Promise<GooglePlaceRow[]> {
  try {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus",
        },
        body: JSON.stringify({
          textQuery,
          openNow: true,
          languageCode: "tr",
          maxResultCount: 5,
          locationBias: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: 12000,
            },
          },
        }),
        cache: "no-store",
      }
    );

    const data = (await res.json()) as {
      places?: GooglePlaceRow[];
      error?: { message?: string; status?: string };
    };

    if (!res.ok) {
      return [];
    }

    return data.places ?? [];
  } catch {
    return [];
  }
}
