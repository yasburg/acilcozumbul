/**
 * Çekici fiyat tahmini — pazar yeri bandı (kesin fiyat değil).
 * Rakip araçlardan farklı: mesafe dilimleri + şehir katmanı + saat + durum.
 */

import { ilKoordinatBul } from "@/lib/turkiye-il-koordinat";

export const CEKICI_ARAC_TIPLERI = [
  { id: "otomobil", etiket: "Otomobil", carpan: 1 },
  { id: "suv", etiket: "Arazi / SUV / Pickup", carpan: 1.12 },
  { id: "hafif_ticari", etiket: "Minivan / Panelvan", carpan: 1.18 },
  { id: "minibus", etiket: "Minibüs / Midibüs", carpan: 1.35 },
  { id: "agir", etiket: "Kamyon / Kamyonet", carpan: 1.55 },
  { id: "otobus", etiket: "Otobüs", carpan: 1.7 },
  { id: "motosiklet", etiket: "Motosiklet / ATV / UTV", carpan: 0.78 },
  { id: "karavan", etiket: "Karavan", carpan: 1.4 },
] as const;

export type CekiciAracTipiId = (typeof CEKICI_ARAC_TIPLERI)[number]["id"];

export const CEKICI_SAAT_DILIMLERI = [
  { id: "gunduz", etiket: "Gündüz (08:00–18:00)", carpan: 1 },
  { id: "aksam", etiket: "Akşam (18:00–00:00)", carpan: 1.1 },
  { id: "gece", etiket: "Gece (00:00–08:00)", carpan: 1.22 },
] as const;

export type CekiciSaatId = (typeof CEKICI_SAAT_DILIMLERI)[number]["id"];

export const CEKICI_ARAC_DURUMLARI = [
  { id: "standart", etiket: "Standart çekim (yuvarlanır)", carpan: 1 },
  { id: "kilitli", etiket: "Tekerlek kilitli / çekilemez", carpan: 1.16 },
  { id: "kurtarma", etiket: "Kazalı / ters / kurtarma", carpan: 1.42 },
] as const;

export type CekiciDurumId = (typeof CEKICI_ARAC_DURUMLARI)[number]["id"];

export type CekiciMesafeKapsam = "sehir_ici" | "sehirler_arasi";

/** Büyük şehirlerde taban ve trafik primi */
const METRO_ILLER = new Set([
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
]);

export type CekiciFiyatGirdi = {
  sehirAd: string;
  kapsam: CekiciMesafeKapsam;
  mesafeKm: number;
  aracTipi: CekiciAracTipiId;
  saat: CekiciSaatId;
  durum: CekiciDurumId;
  otoyolGecis?: boolean;
};

export type CekiciFiyatSonuc = {
  orta: number;
  dusuk: number;
  yuksek: number;
  kmBasiOrtalama: number;
  ozet: string[];
};

export type LatLngNokta = { lat: number; lng: number };

function yuvarla50(n: number): number {
  return Math.round(n / 50) * 50;
}

function aracCarpan(id: CekiciAracTipiId): number {
  return CEKICI_ARAC_TIPLERI.find((a) => a.id === id)?.carpan ?? 1;
}

function saatCarpan(id: CekiciSaatId): number {
  return CEKICI_SAAT_DILIMLERI.find((a) => a.id === id)?.carpan ?? 1;
}

function durumCarpan(id: CekiciDurumId): number {
  return CEKICI_ARAC_DURUMLARI.find((a) => a.id === id)?.carpan ?? 1;
}

/** İlçe adına göre şehir merkezinden tutarlı ofset (API yokken) */
export function ilceMerkezOfset(ilceAd: string): { dLat: number; dLng: number } {
  let h = 0;
  for (let i = 0; i < ilceAd.length; i++) {
    h = (h * 31 + ilceAd.charCodeAt(i)) >>> 0;
  }
  const a = (h % 1000) / 1000;
  const b = ((h >>> 10) % 1000) / 1000;
  const rKm = 4 + a * 18;
  const aci = b * Math.PI * 2;
  return {
    dLat: (rKm / 111) * Math.cos(aci),
    dLng: (rKm / 85) * Math.sin(aci),
  };
}

export function noktaIlIlce(
  sehirAd: string,
  ilceAd?: string | null
): LatLngNokta | null {
  const merkez = ilKoordinatBul(sehirAd);
  if (!merkez) return null;
  if (!ilceAd?.trim()) return { lat: merkez.lat, lng: merkez.lon };
  const o = ilceMerkezOfset(ilceAd.trim());
  return { lat: merkez.lat + o.dLat, lng: merkez.lon + o.dLng };
}

export function haversineKm(a: LatLngNokta, b: LatLngNokta): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

/** Kuş uçuşu → yol mesafesi (ortalama katsayı) */
export function yolMesafesiKm(kusUcusuKm: number): number {
  const k = Math.max(0.5, kusUcusuKm);
  const carpan = k < 25 ? 1.45 : k < 100 ? 1.35 : 1.28;
  return Math.max(1, Math.round(k * carpan));
}

export function mesafeKapsamBul(
  cikisIl: string,
  varisIl: string
): CekiciMesafeKapsam {
  return cikisIl === varisIl ? "sehir_ici" : "sehirler_arasi";
}

export function rotaMesafeKm(opts: {
  cikisIl: string;
  cikisIlce?: string | null;
  varisIl: string;
  varisIlce?: string | null;
  cikisKoordinat?: LatLngNokta | null;
  varisKoordinat?: LatLngNokta | null;
}): number | null {
  const a =
    opts.cikisKoordinat ?? noktaIlIlce(opts.cikisIl, opts.cikisIlce);
  const b =
    opts.varisKoordinat ?? noktaIlIlce(opts.varisIl, opts.varisIlce);
  if (!a || !b) return null;
  const kus = haversineKm(a, b);
  if (kus < 0.3 && opts.cikisIl === opts.varisIl) {
    return 8;
  }
  return yolMesafesiKm(kus);
}

function mesafeTabani(
  kapsam: CekiciMesafeKapsam,
  km: number,
  metro: boolean
): number {
  const k = Math.max(1, Math.min(800, km));
  if (kapsam === "sehir_ici") {
    const taban = metro ? 1100 : 850;
    let tutar = taban;
    if (k <= 8) {
      tutar += k * (metro ? 70 : 55);
    } else if (k <= 25) {
      tutar += 8 * (metro ? 70 : 55) + (k - 8) * (metro ? 42 : 34);
    } else {
      tutar +=
        8 * (metro ? 70 : 55) +
        17 * (metro ? 42 : 34) +
        (k - 25) * (metro ? 28 : 22);
    }
    return tutar;
  }

  const taban = metro ? 1400 : 1150;
  let tutar = taban;
  if (k <= 50) {
    tutar += k * 22;
  } else if (k <= 150) {
    tutar += 50 * 22 + (k - 50) * 16;
  } else {
    tutar += 50 * 22 + 100 * 16 + (k - 150) * 12;
  }
  return tutar;
}

export function cekiciFiyatTahmini(girdi: CekiciFiyatGirdi): CekiciFiyatSonuc {
  const km = Math.max(1, Math.min(800, Math.round(girdi.mesafeKm)));
  const metro = METRO_ILLER.has(girdi.sehirAd);
  const ham =
    mesafeTabani(girdi.kapsam, km, metro) *
    aracCarpan(girdi.aracTipi) *
    saatCarpan(girdi.saat) *
    durumCarpan(girdi.durum);

  const otoyol = girdi.otoyolGecis ? (metro ? 180 : 120) : 0;
  // Tek yön mesafe hesaplanır; çekici boş dönüş yaptığı için band x2.
  // Pazar fiyatı gerçeğe yaklaşsın diye %10 piyasa primi.
  const orta = yuvarla50((ham + otoyol) * 2 * 1.1);
  const dusuk = yuvarla50(orta * 0.78);
  const yuksek = yuvarla50(orta * 1.32);
  const kmBasiOrtalama = Math.round(orta / (km * 2));

  const ozet: string[] = [
    girdi.kapsam === "sehir_ici"
      ? "Şehir içi dilimli mesafe tarifesi uygulandı"
      : "Şehirler arası azalan km dilimleri uygulandı",
    `Tek yön rota ≈ ${km} km · gidiş-dönüş dahil (x2)`,
  ];
  if (metro) ozet.push(`${girdi.sehirAd} için büyükşehir / trafik primi`);
  if (girdi.saat !== "gunduz") ozet.push("Saat dilimi çarpanı eklendi");
  if (girdi.durum !== "standart") ozet.push("Araç durumu çarpanı eklendi");
  if (girdi.otoyolGecis) ozet.push("Otoyol / köprü geçiş payı eklendi");

  return { orta, dusuk, yuksek, kmBasiOrtalama, ozet };
}

export function tlYazi(n: number): string {
  return new Intl.NumberFormat("tr-TR").format(n) + " ₺";
}
