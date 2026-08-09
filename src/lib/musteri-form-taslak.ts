/** Ana sayfa talep formu — sekme/app değişiminde state koruması (sessionStorage) */

import {
  ihaleSureTipiNormalize,
  type IhaleSureTipi,
} from "@/lib/ihale";
import type { KonumKaynak } from "@/lib/types";

const STORAGE_KEY = "acilcozum_musteri_form_taslak";

export type MusteriFormAlanlari = {
  ad: string;
  soyad: string;
  telefon: string;
  lat: number;
  lng: number;
  adres: string;
  /** Arıza konumu GPS mi, il/ilçe-adres mi */
  konumKaynak?: KonumKaynak;
  hedefLat: number;
  hedefLng: number;
  hedefAdres: string;
  sorunTipi: string;
  sorunDetay: string;
  aracTipi: string;
  /** Serbest model metni (eski taslaklar); yeni akışta boş kalır */
  aracModeli: string;
  /** calisiyor | calismiyor_bosa_aliniyor | calismiyor_bosa_alinamiyor */
  aracDurumu: string;
  /** yama | degisim — yalnız lastik tipinde */
  lastikDurumu: string;
};

/**
 * / klasik wizard + /b 3 ekran; eski konum/detay değerleri korunur.
 * `detay` eski (tek) adım — MusteriAnaSayfa artık onu fotograf/arac_tipi/
 * arac_durumu/ek_detay/ihale alt adımlarına böler (geriye dönük uyum için tutulur).
 */
export type MusteriFormAdim =
  | "bilgi"
  | "konum"
  | "sorun"
  | "detay"
  | "fotograf"
  | "arac_tipi"
  | "arac_modeli"
  | "arac_durumu"
  | "lastik_durumu"
  | "ek_detay"
  | "ihale"
  | "hedef";

export type MusteriFormTaslak = {
  v: 1;
  step: MusteriFormAdim;
  form: MusteriFormAlanlari;
  yasalOnay: boolean;
  /** [araç, arıza] data URL — eski tek string taslaklar okunurken normalize edilir */
  fotografOnizleme: [string | null, string | null];
  fotografData: [string | null, string | null];
  /** Hedef adımında «bilmiyorum sonra seçeceğim» */
  hedefBilinmiyor?: boolean;
  ihaleSureTipi?: IhaleSureTipi;
  ihaleOzelBitis?: string;
};

function fotografSlotNormalize(
  raw: unknown
): [string | null, string | null] {
  if (typeof raw === "string" && raw.trim()) {
    return [raw, null];
  }
  if (Array.isArray(raw)) {
    const a = typeof raw[0] === "string" && raw[0].trim() ? raw[0] : null;
    const b = typeof raw[1] === "string" && raw[1].trim() ? raw[1] : null;
    return [a, b];
  }
  return [null, null];
}

function fotografSlotDoluMu(slot: [string | null, string | null]): boolean {
  return Boolean(slot[0] || slot[1]);
}

const ADIMLAR: ReadonlySet<string> = new Set([
  "bilgi",
  "konum",
  "sorun",
  "detay",
  "fotograf",
  "arac_tipi",
  "arac_modeli",
  "arac_durumu",
  "lastik_durumu",
  "ek_detay",
  "ihale",
  "hedef",
]);

/** /b dönüşüm akışı — konum/detay (+ alt adımları) → sorun; bilgi korunur */
export function musteriFormAdimDonusumNormalize(
  step: string
): "sorun" | "hedef" | "bilgi" {
  if (
    step === "konum" ||
    step === "detay" ||
    step === "fotograf" ||
    step === "arac_tipi" ||
    step === "arac_modeli" ||
    step === "arac_durumu" ||
    step === "lastik_durumu" ||
    step === "ek_detay" ||
    step === "ihale"
  ) {
    return "sorun";
  }
  if (step === "bilgi" || step === "hedef" || step === "sorun") return step;
  return "sorun";
}

function session(): Storage | null {
  if (typeof globalThis === "undefined") return null;
  try {
    const ss = (globalThis as { sessionStorage?: Storage }).sessionStorage;
    return ss ?? null;
  } catch {
    return null;
  }
}

function sayi(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function metin(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function formDogrula(raw: unknown): MusteriFormAlanlari | null {
  if (!raw || typeof raw !== "object") return null;
  const f = raw as Record<string, unknown>;
  const konumKaynak =
    f.konumKaynak === "gps" || f.konumKaynak === "manuel"
      ? f.konumKaynak
      : undefined;
  return {
    ad: metin(f.ad),
    soyad: metin(f.soyad),
    telefon: metin(f.telefon),
    lat: sayi(f.lat),
    lng: sayi(f.lng),
    adres: metin(f.adres),
    ...(konumKaynak ? { konumKaynak } : {}),
    hedefLat: sayi(f.hedefLat),
    hedefLng: sayi(f.hedefLng),
    hedefAdres: metin(f.hedefAdres),
    sorunTipi: metin(f.sorunTipi),
    sorunDetay: metin(f.sorunDetay),
    aracTipi: metin(f.aracTipi),
    aracModeli: metin(f.aracModeli),
    aracDurumu: metin(f.aracDurumu),
    lastikDurumu: metin(f.lastikDurumu),
  };
}

export function musteriFormTaslakOku(): MusteriFormTaslak | null {
  const ss = session();
  if (!ss) return null;
  try {
    const raw = ss.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const p = parsed as Record<string, unknown>;
    if (p.v !== 1) return null;
    if (typeof p.step !== "string" || !ADIMLAR.has(p.step)) return null;
    const form = formDogrula(p.form);
    if (!form) return null;
    return {
      v: 1,
      step: p.step as MusteriFormAdim,
      form,
      yasalOnay: p.yasalOnay === true,
      fotografOnizleme: fotografSlotNormalize(p.fotografOnizleme),
      fotografData: fotografSlotNormalize(p.fotografData),
      hedefBilinmiyor: p.hedefBilinmiyor === true,
      ihaleSureTipi: ihaleSureTipiNormalize(p.ihaleSureTipi),
      ihaleOzelBitis:
        typeof p.ihaleOzelBitis === "string" ? p.ihaleOzelBitis : undefined,
    };
  } catch {
    return null;
  }
}

function yaz(payload: MusteriFormTaslak): boolean {
  const ss = session();
  if (!ss) return false;
  try {
    ss.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

/** Fotoğraf büyükse önce fotosuz dene (QuotaExceeded). */
export function musteriFormTaslakKaydet(taslak: MusteriFormTaslak): void {
  const tam: MusteriFormTaslak = { ...taslak, v: 1 };
  if (yaz(tam)) return;
  if (fotografSlotDoluMu(tam.fotografData) || fotografSlotDoluMu(tam.fotografOnizleme)) {
    yaz({
      ...tam,
      fotografData: [null, null],
      fotografOnizleme: [null, null],
    });
  }
}

export function musteriFormTaslakSil(): void {
  const ss = session();
  if (!ss) return;
  try {
    ss.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function musteriFormTaslakBosMu(t: MusteriFormTaslak): boolean {
  const f = t.form;
  return (
    (t.step === "sorun" || t.step === "konum") &&
    !t.yasalOnay &&
    !f.ad &&
    !f.soyad &&
    !f.telefon &&
    !f.adres &&
    !f.hedefAdres &&
    !f.sorunTipi &&
    !f.sorunDetay &&
    !f.aracModeli &&
    !f.aracDurumu &&
    !f.lastikDurumu &&
    !f.lat &&
    !f.lng &&
    !t.hedefBilinmiyor &&
    !fotografSlotDoluMu(t.fotografData) &&
    !fotografSlotDoluMu(t.fotografOnizleme)
  );
}
