import { googleMapsApiKey } from "./google-maps";
import { googleMapsScrapeOtoTamir } from "./google-maps-scrape";
import {
  mesafeKmHaversine,
  otoTamirAramaSorgusu,
  SERVIS_ONERI_GRUPLARI,
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
  rating?: number;
  userRatingCount?: number;
};

type PlacesSearchSonuc = {
  places: GooglePlaceRow[];
  hata?: string;
};

function placeToOneri(
  p: GooglePlaceRow,
  textQuery: string,
  originLat: number,
  originLng: number
): KonumOneri | null {
  const itemLat = p.location?.latitude;
  const itemLng = p.location?.longitude;
  if (itemLat == null || itemLng == null) return null;
  if (p.businessStatus && p.businessStatus !== "OPERATIONAL") return null;
  const adres = p.formattedAddress ?? "";
  if (!adres) return null;
  return {
    ad: p.displayName?.text ?? textQuery,
    adres,
    lat: itemLat,
    lng: itemLng,
    mesafeKm:
      Math.round(mesafeKmHaversine(originLat, originLng, itemLat, itemLng) * 10) /
      10,
    placeId: p.id,
    puan:
      typeof p.rating === "number" && Number.isFinite(p.rating)
        ? Math.round(p.rating * 10) / 10
        : undefined,
    puanSayisi:
      typeof p.userRatingCount === "number" && p.userRatingCount > 0
        ? p.userRatingCount
        : undefined,
  };
}

function semtAdresteMi(adres: string, semt?: string): boolean {
  if (!semt?.trim()) return true;
  return adres
    .toLocaleLowerCase("tr-TR")
    .includes(semt.trim().toLocaleLowerCase("tr-TR"));
}

function siralaSemtOnce(
  adaylar: KonumOneri[],
  semt?: string
): KonumOneri[] {
  return adaylar.slice().sort((a, b) => {
    const aSemt = semtAdresteMi(a.adres, semt) ? 0 : 1;
    const bSemt = semtAdresteMi(b.adres, semt) ? 0 : 1;
    if (aSemt !== bSemt) return aSemt - bSemt;
    return (a.mesafeKm ?? 99) - (b.mesafeKm ?? 99);
  });
}

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
  let sonHata: string | undefined;

  for (const textQuery of aramalar) {
    if (adaylar.length >= limit + excludeIds.size + excludeAdres.size) break;

    const { places, hata } = await placesTextSearch(lat, lng, textQuery, key, {
      openNow: true,
    });
    if (hata) sonHata = hata;
    for (const p of places) {
      const o = placeToOneri(p, textQuery, lat, lng);
      if (!o) continue;
      if (o.placeId && excludeIds.has(o.placeId)) continue;
      if (excludeAdres.has(o.adres)) continue;
      adaylar.push(o);
    }
  }

  const benzersiz = new Map<string, KonumOneri>();
  for (const o of adaylar.sort(
    (a, b) => (a.mesafeKm ?? 99) - (b.mesafeKm ?? 99)
  )) {
    const anahtar = o.placeId ?? o.adres;
    if (!benzersiz.has(anahtar)) benzersiz.set(anahtar, o);
  }

  return {
    oneriler: Array.from(benzersiz.values()).slice(0, limit),
    hata: sonHata,
  };
}

/**
 * Bekleme / hedef ekranı: 5 Oto Tamir (Maps tarzı sorgu) + 3 oto sanayi.
 * Places API başarısızsa oto tamir için Playwright Maps scrape (GoogleMapsScraper yöntemi).
 */
export async function googleServisGrupOnerileri(
  lat: number,
  lng: number,
  opts: HedefOneriSecenekleri = {}
): Promise<{
  oneriler: KonumOneri[];
  hata?: string;
  semt?: string;
  kaynakDetay?: "places" | "maps_scrape";
}> {
  const key = googleMapsApiKey();
  const semt = opts.semt?.trim() || undefined;
  const il = opts.il?.trim() || undefined;
  const kullanilan = new Set<string>([
    ...(opts.excludePlaceIds ?? []),
    ...(opts.excludeAdres ?? []),
  ]);
  const sonuc: KonumOneri[] = [];
  let sonHata: string | undefined;
  let kaynakDetay: "places" | "maps_scrape" = "places";

  for (const grup of SERVIS_ONERI_GRUPLARI) {
    const sorgu =
      grup.kategori === "oto_tamir"
        ? otoTamirAramaSorgusu({ semt, il })
        : grup.sorgu;

    let places: GooglePlaceRow[] = [];

    if (key) {
      /* Maps araması gibi: openNow kapalı, oto tamirde car_repair tipi */
      const ilk = await placesTextSearch(lat, lng, sorgu, key, {
        maxResultCount: 12,
        openNow: false,
        radiusM: grup.yaricapM,
        includedType:
          grup.kategori === "oto_tamir" ? "car_repair" : undefined,
      });
      places = ilk.places;
      if (ilk.hata) sonHata = ilk.hata;

      if (grup.kategori === "oto_tamir" && places.length === 0) {
        const yedek = await placesTextSearch(
          lat,
          lng,
          semt ? `oto tamir ${semt}` : "oto tamir",
          key,
          {
            maxResultCount: 12,
            openNow: false,
            radiusM: Math.max(grup.yaricapM, 12000),
            includedType: "car_repair",
          }
        );
        places = yedek.places;
        if (yedek.hata) sonHata = yedek.hata;
      }
    } else {
      sonHata = "Google API anahtarı yok";
    }

    let adaylar: KonumOneri[] = [];
    for (const p of places) {
      const o = placeToOneri(p, sorgu, lat, lng);
      if (!o) continue;
      const anahtar = o.placeId ?? o.adres;
      if (kullanilan.has(anahtar) || kullanilan.has(o.adres)) continue;
      if (o.placeId && (opts.excludePlaceIds ?? []).includes(o.placeId)) {
        continue;
      }
      if ((opts.excludeAdres ?? []).includes(o.adres)) continue;
      adaylar.push({ ...o, kategori: grup.kategori });
    }

    /* Places boş/hatalı → GoogleMapsScraper tarzı Maps scrape */
    if (grup.kategori === "oto_tamir" && adaylar.length === 0) {
      const scrape = await googleMapsScrapeOtoTamir(lat, lng, {
        semt,
        il,
        limit: grup.limit,
      });
      if (scrape.hata) sonHata = scrape.hata;
      if (scrape.oneriler.length > 0) {
        kaynakDetay = "maps_scrape";
        adaylar = scrape.oneriler.filter((o) => {
          const anahtar = o.placeId ?? o.adres;
          return !kullanilan.has(anahtar) && !kullanilan.has(o.adres);
        });
      }
    }

    const sirali =
      grup.kategori === "oto_tamir"
        ? siralaSemtOnce(adaylar, semt)
        : adaylar.slice().sort((a, b) => (a.mesafeKm ?? 99) - (b.mesafeKm ?? 99));

    let no = 0;
    for (const o of sirali) {
      if (no >= grup.limit) break;
      /* Oto tamirde semt adreste yoksa ama semtli sonuç varsa atla */
      if (
        grup.kategori === "oto_tamir" &&
        semt &&
        sirali.some((x) => semtAdresteMi(x.adres, semt)) &&
        !semtAdresteMi(o.adres, semt)
      ) {
        continue;
      }
      const anahtar = o.placeId ?? o.adres;
      kullanilan.add(anahtar);
      kullanilan.add(o.adres);
      no += 1;
      sonuc.push({ ...o, etiketNo: no });
    }
  }

  return { oneriler: sonuc, semt, hata: sonHata, kaynakDetay };
}

async function placesTextSearch(
  lat: number,
  lng: number,
  textQuery: string,
  key: string,
  opts?: {
    maxResultCount?: number;
    openNow?: boolean;
    radiusM?: number;
    includedType?: string;
  }
): Promise<PlacesSearchSonuc> {
  try {
    const body: Record<string, unknown> = {
      textQuery,
      languageCode: "tr",
      regionCode: "TR",
      maxResultCount: opts?.maxResultCount ?? 10,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: opts?.radiusM ?? 12000,
        },
      },
    };
    if (opts?.openNow) body.openNow = true;
    if (opts?.includedType) body.includedType = opts.includedType;

    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus,places.rating,places.userRatingCount",
          /* Website kısıtlı anahtarda sunucu çağrıları boş referer ile reddedilir */
          Referer: "https://acilcozumbul.com/",
          Origin: "https://acilcozumbul.com",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const data = (await res.json()) as {
      places?: GooglePlaceRow[];
      error?: { message?: string; status?: string };
    };

    if (!res.ok) {
      const hata = `${data.error?.status ?? res.status}: ${
        data.error?.message ?? res.statusText
      }`;
      console.warn("[places:searchText]", textQuery, hata);
      return { places: [], hata };
    }

    return { places: data.places ?? [] };
  } catch (e) {
    const hata = e instanceof Error ? e.message : "Places isteği başarısız";
    console.warn("[places:searchText]", textQuery, hata);
    return { places: [], hata };
  }
}
