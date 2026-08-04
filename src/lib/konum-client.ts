export type KonumIzniDurumu =
  | "granted"
  | "denied"
  | "prompt"
  | "unsupported"
  | "unknown";

export function konumGuvenliMi(): boolean {
  if (typeof window === "undefined") return false;
  return window.isSecureContext === true;
}

/** Yerel ağ IP’si (telefon testi) */
export function yerelAgHostu(host: string): boolean {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  );
}

/** http:// yerel IP → https:// aynı host (GPS için gerekli) */
export function lanHttpsUrl(): string | null {
  if (typeof window === "undefined" || konumGuvenliMi()) return null;
  const { hostname, port, pathname, search } = window.location;
  if (!yerelAgHostu(hostname)) return null;
  const p = port || "3000";
  return `https://${hostname}:${p}${pathname}${search}`;
}

export function cihazPlatformu(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

/** Telefon ayarlarında konum izni açma adımları (web’den ayarlara otomatik gidilemez) */
export function konumAyarlariAdimlari(): string[] {
  const p = cihazPlatformu();
  if (p === "ios") {
    return [
      "iPhone’da Ayarlar uygulamasını açın",
      "Gizlilik ve Güvenlik → Konum Servisleri",
      "Konum Servisleri açık olmalı",
      "Aşağı kaydırıp Safari’yi seçin",
      "«Uygulama Kullanırken» veya «İzin Ver» seçin (Asla seçmeyin)",
      "Safari’de aA → Web Sitesi Ayarları → acilcozumbul.com → Konum: İzin Ver",
      "Sayfayı yenileyin ve «GPS konumumu paylaş»a tekrar basın",
    ];
  }
  if (p === "android") {
    return [
      "Ayarlar → Uygulamalar → Chrome (veya kullandığınız tarayıcı)",
      "İzinler → Konum → «İzin ver»",
      "Alternatif: sitede adres çubuğundaki kilit ikonu → Site ayarları → Konum → İzin ver",
      "Sayfayı yenileyip «Konumumu Paylaş»a tekrar basın",
    ];
  }
  return [
    "Tarayıcı ayarlarından bu site için konum iznini «İzin ver» yapın",
    "Sayfayı yenileyip tekrar deneyin",
  ];
}

/**
 * Safari iOS often reports "denied" here while site settings are "Allow".
 * Do not use this alone to block getCurrentPosition — only for UI hints.
 * Never await this *before* getCurrentPosition on a click: Safari may skip
 * the permission dialog if the user-gesture chain is broken.
 */
export async function konumIzniOku(): Promise<KonumIzniDurumu> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return "unsupported";
  }
  if (!navigator.permissions?.query) {
    return "unknown";
  }
  try {
    const result = await navigator.permissions.query({
      name: "geolocation",
    });
    return result.state as KonumIzniDurumu;
  } catch {
    return "unknown";
  }
}

export function konumIzniDinle(
  callback: (durum: KonumIzniDurumu) => void
): () => void {
  if (!navigator.permissions?.query) return () => {};
  let permission: PermissionStatus | null = null;
  const handler = () => {
    if (permission) callback(permission.state as KonumIzniDurumu);
  };
  navigator.permissions
    .query({ name: "geolocation" })
    .then((p) => {
      permission = p;
      p.addEventListener("change", handler);
    })
    .catch(() => {});
  return () => permission?.removeEventListener("change", handler);
}

export function konumHataMesaji(code?: number): string {
  switch (code) {
    case 1:
      return "Konum izni verilmedi veya reddedildi. Aşağıdaki adımlarla Ayarlar’dan açabilirsiniz.";
    case 2:
      return "Konum şu an kullanılamıyor. Adresi elle yazın.";
    case 3:
      return "Konum isteği zaman aşımına uğradı. Tekrar deneyin veya adresi elle yazın.";
    default:
      if (!konumGuvenliMi()) {
        return "Telefonda http:// adresiyle GPS çalışmaz. Adresi elle yazın veya https:// ile açın (npm run dev:lan:https).";
      }
      return "Konum alınamadı. Lütfen adresi elle girin.";
  }
}

/** Gerçek Chrome (iOS CriOS / Android Chrome); WebView ve diğer tarayıcılar hariç */
export function chromeIciMi(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/CriOS\//i.test(ua)) return true;
  if (/FxiOS|EdgiOS|OPiOS|EdgA|OPR|SamsungBrowser|Firefox\//i.test(ua)) {
    return false;
  }
  if (/Android/i.test(ua) && /Chrome\//i.test(ua) && !/;\s*wv\)/i.test(ua)) {
    return true;
  }
  return false;
}

/**
 * Mevcut (veya verilen) sayfayı Chrome’da açmak için deep link.
 * Zaten Chrome’daysa veya masaüstündeyse null.
 */
export function chromeAcUrl(href?: string): string | null {
  if (typeof window === "undefined") return null;
  if (chromeIciMi()) return null;
  const platform = cihazPlatformu();
  if (platform !== "ios" && platform !== "android") return null;

  let hedef: URL;
  try {
    hedef = new URL(href ?? window.location.href);
  } catch {
    return null;
  }

  if (platform === "ios") {
    const scheme = hedef.protocol === "https:" ? "googlechromes" : "googlechrome";
    return `${scheme}://${hedef.host}${hedef.pathname}${hedef.search}${hedef.hash}`;
  }

  const hostPath = `${hedef.host}${hedef.pathname}${hedef.search}${hedef.hash}`;
  const scheme = hedef.protocol === "https:" ? "https" : "http";
  const fallback = encodeURIComponent(hedef.href);
  return `intent://${hostPath}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
}

/** Konum Safari / uygulama içi tarayıcıda çalışmazsa Chrome’a yönlendir */
export function chromeAc(href?: string): boolean {
  const link = chromeAcUrl(href);
  if (!link) return false;
  window.location.href = link;
  return true;
}

/** Elle yazılan adresi koordinata çevir (Nominatim) */
export async function geocodeAdres(
  sorgu: string
): Promise<{ lat: number; lng: number; adres: string } | null> {
  const q = sorgu.trim();
  if (q.length < 4) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=tr&accept-language=tr`,
      { headers: { "Accept-Language": "tr" } }
    );
    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    const ilk = data[0];
    if (!ilk) return null;
    return {
      lat: parseFloat(ilk.lat),
      lng: parseFloat(ilk.lon),
      adres: ilk.display_name,
    };
  } catch {
    return null;
  }
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  let adres = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=tr`,
      { headers: { "Accept-Language": "tr" } }
    );
    const data = await res.json();
    if (data.display_name) adres = data.display_name;
  } catch {
    /* koordinat kalır */
  }
  return adres;
}

export function mevcutKonumAl(
  options?: PositionOptions
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Tarayıcınız konum desteklemiyor."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
      ...options,
    });
  });
}

export async function konumAlEsnek(): Promise<GeolocationPosition> {
  const ios = cihazPlatformu() === "ios";
  const denemeler: PositionOptions[] = ios
    ? [
        /* Safari’de düşük doğruluk genelde daha güvenilir */
        { enableHighAccuracy: false, timeout: 28000, maximumAge: 120000 },
        { enableHighAccuracy: true, timeout: 22000, maximumAge: 0 },
      ]
    : [
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 120000 },
      ];

  let sonHata: unknown;
  for (const opts of denemeler) {
    try {
      return await mevcutKonumAl(opts);
    } catch (e) {
      sonHata = e;
      const code =
        e && typeof e === "object" && "code" in e
          ? (e as GeolocationPositionError).code
          : undefined;
      if (code === 1) throw e;
    }
  }
  throw sonHata;
}
