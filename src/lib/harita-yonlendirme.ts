import { latLngStr, type LatLng } from "./koordinat";
import type { KonumKaynak } from "./types";

/** İl/ilçe ile seçilen (hassas olmayan) konumda WhatsApp canlı paylaşım için */
export const WHATSAPP_MANUEL_KONUM_MESAJI =
  "Merhaba, şimdi konumumu paylaşıyorum.";

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

/** Tek noktayı Google Maps’te açan pin linki */
export function googleMapsKonumUrl(konum: LatLng): string {
  return `https://maps.google.com/?q=${latLngStr(konum)}`;
}

/** Çekiciye WhatsApp’tan gönderilecek konum metni */
export function whatsappKonumMesaji(opts: {
  lat: number;
  lng: number;
  adres?: string;
  kaynak?: KonumKaynak;
}): string {
  if (opts.kaynak === "manuel") return WHATSAPP_MANUEL_KONUM_MESAJI;
  const satirlar = [
    "Merhaba, konumum:",
    googleMapsKonumUrl({ lat: opts.lat, lng: opts.lng }),
  ];
  const adres = opts.adres?.trim();
  if (adres) satirlar.push(`Adres: ${adres}`);
  return satirlar.join("\n");
}

/** GPS yok / il-ilçe: müşteriden canlı konum iste */
export function whatsappCanliKonumIsteMesaji(opts: {
  hizmetVerenAd: string;
  hedef?: LatLng | null;
}): string {
  const ad = opts.hizmetVerenAd.trim() || "hizmet veren";
  let metin =
    `Merhaba, ben Acil Çözüm Bul üzerinden ulaşıyorum. İsmim ${ad}, sistemde tam konumunuz gözükmüyor. Lütfen buradan konum atın.`;
  if (opts.hedef && Number.isFinite(opts.hedef.lat) && Number.isFinite(opts.hedef.lng)) {
    metin += ` Ayrıca seçilen hedef konum: ${googleMapsKonumUrl(opts.hedef)} gözüküyor. Doğru mudur?`;
  }
  metin += " Teşekkürler.";
  return metin;
}

/** GPS var + hedef: müşteriden hedef konumu teyit et */
export function whatsappHedefTeyitMesaji(opts: {
  hizmetVerenAd: string;
  hedef: LatLng;
}): string {
  const ad = opts.hizmetVerenAd.trim() || "hizmet veren";
  return (
    `Merhaba, ben Acil Çözüm Bul üzerinden ulaşıyorum. İsmim ${ad}. ` +
    `Sistemde seçilen hedef konum: ${googleMapsKonumUrl(opts.hedef)} gözüküyor. Doğru mudur? Teşekkürler.`
  );
}

