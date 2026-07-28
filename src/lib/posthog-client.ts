import { cerezAnalitikAktif, cerezOnayOku } from "./cerez-onay";

const UTM_ANAHTARLARI = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

const UTM_STORAGE_KEY = "acilcozum_utm";

type Posthog = typeof import("posthog-js").default;

function posthogAl(): Promise<Posthog | null> {
  if (typeof window === "undefined" || !posthogYapilandirildi()) {
    return Promise.resolve(null);
  }
  return import("posthog-js").then((m) => m.default);
}

export function posthogYapilandirildi(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() ||
      "phc_tpA4yHjeJbkPL24VrMUX77teFfUm8W9NgKsqQXFuKMbP"
  );
}

/** URL veya sessionStorage’dan kampanya parametrelerini oku */
export function posthogUtmOzellikleri(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const out: Record<string, string> = {};
  const params = new URLSearchParams(window.location.search);
  for (const key of UTM_ANAHTARLARI) {
    const v = params.get(key)?.trim();
    if (v) out[key] = v;
  }

  if (Object.keys(out).length > 0) {
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(out));
    } catch {
      /* ignore */
    }
    return out;
  }

  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const key of UTM_ANAHTARLARI) {
      const v = parsed[key];
      if (typeof v === "string" && v.trim()) out[key] = v.trim();
    }
  } catch {
    /* ignore */
  }
  return out;
}

/** UTM/gclid’i sonraki tüm event’lere register et (person + super properties) */
export function posthogKampanyaKaydet(): void {
  if (typeof window === "undefined" || !posthogYapilandirildi()) return;
  if (!cerezAnalitikAktif()) return;

  const props = posthogUtmOzellikleri();
  if (Object.keys(props).length === 0) return;
  void posthogAl().then((ph) => {
    ph?.register(props);
  });
}

/** Çerez tercihine göre PostHog yakalamayı aç/kapat */
export function posthogCerezSenkronize(): void {
  if (typeof window === "undefined" || !posthogYapilandirildi()) return;

  void posthogAl().then((ph) => {
    if (!ph) return;
    if (cerezAnalitikAktif()) {
      ph.opt_in_capturing();
      posthogKampanyaKaydet();
      return;
    }
    if (cerezOnayOku() === "zorunlu") {
      ph.opt_out_capturing();
    }
  });
}

export function posthogOlayYakala(
  olay: string,
  properties?: Record<string, unknown>
): void {
  if (!cerezAnalitikAktif() || !posthogYapilandirildi()) return;
  const utm = posthogUtmOzellikleri();
  void posthogAl().then((ph) => {
    ph?.capture(olay, {
      ...utm,
      ...properties,
    });
  });
}

/**
 * Aynı anahtar için bir kez yakala. Analitik kapalıysa localStorage’a yazmaz
 * (çerez sonra açılınca event kaçmasın).
 * @returns true ise bu çağrıda capture yapıldı (veya kuyruğa alındı)
 */
export function posthogOlayBirKez(
  anahtar: string,
  olay: string,
  properties?: Record<string, unknown>
): boolean {
  if (typeof window === "undefined") return false;
  if (!cerezAnalitikAktif() || !posthogYapilandirildi()) return false;

  try {
    if (localStorage.getItem(anahtar)) return false;
  } catch {
    /* storage yoksa yine dene */
  }

  posthogOlayYakala(olay, properties);

  try {
    localStorage.setItem(anahtar, "1");
  } catch {
    /* ignore */
  }
  return true;
}
