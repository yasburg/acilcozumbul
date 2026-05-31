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

/** OSRM (ücretsiz) — Google Routes kapalıyken yedek */
async function surusSuresiOsrm(
  origin: LatLng,
  destination: LatLng
): Promise<{ dk: number | null; hata?: string }> {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as {
      code?: string;
      routes?: Array<{ duration?: number }>;
    };
    if (data.code !== "Ok" || !data.routes?.[0]?.duration) {
      return { dk: null, hata: "OSRM rota bulunamadı." };
    }
    return {
      dk: Math.max(1, Math.ceil(data.routes[0].duration / 60)),
    };
  } catch {
    return { dk: null, hata: "OSRM bağlantı hatası." };
  }
}

/** Google Routes API (computeRoutes) — sürüş süresi dakika */
async function surusSuresiRoutesApi(
  origin: LatLng,
  destination: LatLng,
  key: string
): Promise<{ dk: number | null; hata?: string }> {
  const res = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "routes.duration",
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: { latitude: origin.lat, longitude: origin.lng },
          },
        },
        destination: {
          location: {
            latLng: { latitude: destination.lat, longitude: destination.lng },
          },
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE",
        languageCode: "tr-TR",
      }),
    }
  );

  const data = (await res.json()) as {
    routes?: Array<{ duration?: string }>;
    error?: { message?: string; status?: string };
  };

  if (!res.ok) {
    const msg = data.error?.message ?? `Routes API hatası (${res.status})`;
    return { dk: null, hata: msg };
  }

  const dk = durationSaniyedenDk(data.routes?.[0]?.duration);
  return dk != null ? { dk } : { dk: null, hata: "Rota bulunamadı." };
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

/** İki nokta arası sürüş süresi (dakika) */
export async function surusSuresiDk(
  origin: LatLng,
  destination: LatLng
): Promise<SurusSuresiSonuc> {
  const key = googleMapsApiKey();
  let googleHata: string | undefined;

  if (key) {
    const routes = await surusSuresiRoutesApi(origin, destination, key);
    if (routes.dk != null) {
      return { dk: routes.dk, kaynak: "google" };
    }
    googleHata = routes.hata;

    const legacy = await surusSuresiLegacyMatrix(origin, destination, key);
    if (legacy.dk != null) {
      return { dk: legacy.dk, kaynak: "google" };
    }
    googleHata = googleHata ?? legacy.hata;
  }

  const osrm = await surusSuresiOsrm(origin, destination);
  if (osrm.dk != null) {
    return {
      dk: osrm.dk,
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
