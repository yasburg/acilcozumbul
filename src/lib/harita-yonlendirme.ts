import { latLngStr, type LatLng } from "./koordinat";

export type HaritaUygulamasi = "google" | "apple";

export function googleMapsRotaUrl(
  musteri: LatLng,
  opts?: { cekici?: LatLng | null; hedef?: LatLng | null }
): string {
  const params = new URLSearchParams({
    api: "1",
    travelmode: "driving",
    destination: latLngStr(opts?.hedef ?? musteri),
  });
  if (opts?.cekici) params.set("origin", latLngStr(opts.cekici));
  if (opts?.hedef) params.set("waypoints", latLngStr(musteri));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function appleMapsRotaUrl(
  musteri: LatLng,
  opts?: { cekici?: LatLng | null; hedef?: LatLng | null }
): string {
  const params = new URLSearchParams({ dirflg: "d" });
  if (opts?.cekici) params.set("saddr", latLngStr(opts.cekici));
  if (opts?.hedef) {
    params.append("daddr", latLngStr(musteri));
    params.append("daddr", latLngStr(opts.hedef));
  } else {
    params.set("daddr", latLngStr(musteri));
  }
  return `https://maps.apple.com/?${params.toString()}`;
}

export function haritaRotaUrl(
  uygulama: HaritaUygulamasi,
  musteri: LatLng,
  opts?: { cekici?: LatLng | null; hedef?: LatLng | null }
): string {
  return uygulama === "apple"
    ? appleMapsRotaUrl(musteri, opts)
    : googleMapsRotaUrl(musteri, opts);
}

/** iPhone / iPad (Safari dahil) */
export function iosCihazMi(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function haritaSecenekleri(
  musteri: LatLng,
  opts?: { cekici?: LatLng | null; hedef?: LatLng | null }
): { id: HaritaUygulamasi; label: string; url: string }[] {
  const google = {
    id: "google" as const,
    label: "Google Maps'te aç",
    url: googleMapsRotaUrl(musteri, opts),
  };
  const apple = {
    id: "apple" as const,
    label: "Apple Maps'te aç",
    url: appleMapsRotaUrl(musteri, opts),
  };
  return iosCihazMi() ? [apple, google] : [google, apple];
}
