/** Geliştirme / localhost — prod’da OSRM uyarısı göstermemek için */
export function yerelOrtamMi(host?: string | null): boolean {
  if (process.env.NODE_ENV === "development") return true;
  if (!host) return false;
  const h = host.split(":")[0].replace(/^\[|\]$/g, "").toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
}

/** Tarayıcıda localhost mu (client bileşenleri) */
export function istemciYerelMi(): boolean {
  if (typeof window === "undefined") return false;
  return yerelOrtamMi(window.location.host);
}
