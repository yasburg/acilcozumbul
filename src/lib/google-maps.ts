import type { LatLng } from "./koordinat";

export type RotaSureKaynagi = "google" | "osrm";

export function googleMapsApiKey(): string | null {
  return (
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    null
  );
}

export function googleMapsYapilandirildi(): boolean {
  return !!googleMapsApiKey();
}

function durationSaniyedenDk(duration: string | undefined): number | null {
  if (!duration) return null;
  const m = /^(\d+)s$/.exec(duration);
  if (!m) return null;
  return Math.max(1, Math.ceil(Number(m[1]) / 60));
}

function latLngBody(n: LatLng) {
  return {
    location: {
      latLng: { latitude: n.lat, longitude: n.lng },
    },
  };
}

function bacakDkListesi(saniyeler: number[]): number[] | null {
  if (saniyeler.length === 0 || saniyeler.some((s) => !Number.isFinite(s))) {
    return null;
  }
  return saniyeler.map((s) => Math.max(1, Math.ceil(s / 60)));
}

/** OSRM (ücretsiz) — tek veya çok duraklı sürüş */
async function surusSuresiOsrm(
  noktalar: LatLng[]
): Promise<{ dk: number | null; bacaklarDk?: number[]; hata?: string }> {
  if (noktalar.length < 2) {
    return { dk: null, hata: "En az iki nokta gerekli." };
  }
  const coords = noktalar.map((n) => `${n.lng},${n.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as {
      code?: string;
      routes?: Array<{
        duration?: number;
        legs?: Array<{ duration?: number }>;
      }>;
    };
    const route = data.routes?.[0];
    if (data.code !== "Ok" || !route?.duration) {
      return { dk: null, hata: "OSRM rota bulunamadı." };
    }
    const bacaklar = bacakDkListesi(
      (route.legs ?? []).map((l) => l.duration ?? NaN)
    );
    return {
      dk: Math.max(1, Math.ceil(route.duration / 60)),
      bacaklarDk: bacaklar ?? undefined,
    };
  } catch {
    return { dk: null, hata: "OSRM bağlantı hatası." };
  }
}

/** Google Routes API (computeRoutes) — ara duraklarla sürüş süresi */
async function surusSuresiRoutesApi(
  noktalar: LatLng[],
  key: string
): Promise<{ dk: number | null; bacaklarDk?: number[]; hata?: string }> {
  if (noktalar.length < 2) {
    return { dk: null, hata: "En az iki nokta gerekli." };
  }
  const origin = noktalar[0]!;
  const destination = noktalar[noktalar.length - 1]!;
  const intermediates = noktalar.slice(1, -1).map(latLngBody);

  const res = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "routes.duration,routes.legs.duration",
        Referer: "https://acilcozumbul.com/",
        Origin: "https://acilcozumbul.com",
      },
      body: JSON.stringify({
        origin: latLngBody(origin),
        destination: latLngBody(destination),
        ...(intermediates.length > 0 ? { intermediates } : {}),
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE",
        languageCode: "tr-TR",
      }),
    }
  );

  const data = (await res.json()) as {
    routes?: Array<{
      duration?: string;
      legs?: Array<{ duration?: string }>;
    }>;
    error?: { message?: string; status?: string };
  };

  if (!res.ok) {
    const msg = data.error?.message ?? `Routes API hatası (${res.status})`;
    return { dk: null, hata: msg };
  }

  const route = data.routes?.[0];
  const dk = durationSaniyedenDk(route?.duration);
  if (dk == null) {
    return { dk: null, hata: "Rota bulunamadı." };
  }

  const bacaklar = (route?.legs ?? [])
    .map((l) => durationSaniyedenDk(l.duration))
    .filter((x): x is number => x != null);

  return {
    dk,
    bacaklarDk: bacaklar.length === noktalar.length - 1 ? bacaklar : undefined,
  };
}

/** Eski Distance Matrix (bazı projelerde hâlâ açık) */
async function surusSuresiLegacyMatrix(
  origin: LatLng,
  destination: LatLng,
  key: string
): Promise<{ dk: number | null; hata?: string }> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/distancematrix/json"
  );
  url.searchParams.set("origins", `${origin.lat},${origin.lng}`);
  url.searchParams.set("destinations", `${destination.lat},${destination.lng}`);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("language", "tr");
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = (await res.json()) as {
    status: string;
    error_message?: string;
    rows?: Array<{
      elements?: Array<{
        status: string;
        duration?: { value: number };
      }>;
    }>;
  };

  if (data.status !== "OK") {
    return {
      dk: null,
      hata: data.error_message ?? data.status,
    };
  }

  const el = data.rows?.[0]?.elements?.[0];
  if (!el || el.status !== "OK" || !el.duration) {
    return { dk: null, hata: el?.status ?? "ZERO_RESULTS" };
  }

  return { dk: Math.max(1, Math.ceil(el.duration.value / 60)) };
}

export type SurusSuresiSonuc = {
  dk: number | null;
  hata?: string;
  kaynak?: RotaSureKaynagi;
  googleHata?: string;
};

export type SurusSuresiCokNoktaSonuc = SurusSuresiSonuc & {
  /** Bacak süreleri (dk): [çekici→müşteri, müşteri→hedef, …] */
  bacaklarDk?: number[];
};

/**
 * Çok duraklı sürüş: örn. çekici → hizmet alan → hedef.
 * Tek Google/OSRM isteğinde ara duraklar (intermediates) kullanılır.
 */
export async function surusSuresiCokNokta(
  noktalar: LatLng[]
): Promise<SurusSuresiCokNoktaSonuc> {
  const temiz = noktalar.filter(
    (n) => Number.isFinite(n.lat) && Number.isFinite(n.lng)
  );
  if (temiz.length < 2) {
    return { dk: null, hata: "En az iki geçerli nokta gerekli." };
  }

  const key = googleMapsApiKey();
  let googleHata: string | undefined;

  if (key) {
    const routes = await surusSuresiRoutesApi(temiz, key);
    if (routes.dk != null) {
      return {
        dk: routes.dk,
        bacaklarDk: routes.bacaklarDk,
        kaynak: "google",
      };
    }
    googleHata = routes.hata;

    /* Tek bacakta Distance Matrix yedek; çok bacakta çift-çift topla */
    if (temiz.length === 2) {
      const legacy = await surusSuresiLegacyMatrix(temiz[0]!, temiz[1]!, key);
      if (legacy.dk != null) {
        return {
          dk: legacy.dk,
          bacaklarDk: [legacy.dk],
          kaynak: "google",
        };
      }
      googleHata = googleHata ?? legacy.hata;
    } else {
      const bacaklar: number[] = [];
      let matrixHata: string | undefined;
      for (let i = 0; i < temiz.length - 1; i++) {
        const leg = await surusSuresiLegacyMatrix(temiz[i]!, temiz[i + 1]!, key);
        if (leg.dk == null) {
          matrixHata = leg.hata;
          bacaklar.length = 0;
          break;
        }
        bacaklar.push(leg.dk);
      }
      if (bacaklar.length === temiz.length - 1) {
        return {
          dk: bacaklar.reduce((a, b) => a + b, 0),
          bacaklarDk: bacaklar,
          kaynak: "google",
        };
      }
      googleHata = googleHata ?? matrixHata;
    }
  }

  const osrm = await surusSuresiOsrm(temiz);
  if (osrm.dk != null) {
    return {
      dk: osrm.dk,
      bacaklarDk: osrm.bacaklarDk,
      kaynak: "osrm",
      googleHata,
    };
  }

  return {
    dk: null,
    hata:
      googleHata ??
      osrm.hata ??
      "Süre hesaplanamadı. Google Routes API’yi proje 311405404372 için etkinleştirin.",
    googleHata,
  };
}

/** İki nokta arası sürüş süresi (dakika) */
export async function surusSuresiDk(
  origin: LatLng,
  destination: LatLng
): Promise<SurusSuresiSonuc> {
  const sonuc = await surusSuresiCokNokta([origin, destination]);
  return {
    dk: sonuc.dk,
    hata: sonuc.hata,
    kaynak: sonuc.kaynak,
    googleHata: sonuc.googleHata,
  };
}
