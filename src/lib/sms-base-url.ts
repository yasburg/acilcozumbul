const CANONICAL_SITE = "https://acilcozumbul.com";

function normalizeBase(url: string): string {
  return url.replace(/\/$/, "");
}

/** localhost, LAN IP veya özel ağ — SMS linklerinde kullanılmaz */
export function yerelVeyaOzelAgUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase();
    if (h === "localhost" || h === "127.0.0.1" || h === "::1") return true;
    if (/^10\./.test(h)) return true;
    if (/^192\.168\./.test(h)) return true;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
    return false;
  } catch {
    return true;
  }
}

/**
 * SMS / dış bildirim linkleri için taban URL.
 * Yerel IP (10.x, localhost) yerine her zaman canlı domain kullanılır.
 */
export function smsBaseUrl(fallback?: string): string {
  const ozel =
    process.env.SMS_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    fallback?.trim();

  if (ozel && !yerelVeyaOzelAgUrl(ozel)) {
    return normalizeBase(ozel);
  }

  return CANONICAL_SITE;
}
