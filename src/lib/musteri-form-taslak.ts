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
  aracModeli: string;
  /** Araç durumu (çalışıyor / boşa alınabiliyor …) */
  aracDurumu: string;
  /** yama | degisim — yalnız lastik tipinde */
  lastikDurumu: string;
  /** benzin | dizel | lpg | elektrik — yalnız yakit tipinde */
  yakitTipi: string;
  /** iceride | kayip | kirik | kumanda | kontak | diger — yalnız kilit tipinde */
  kilitDurumu: string;
};

/**
 * / klasik wizard + /b 3 ekran; eski konum/detay değerleri korunur.
 * `detay` eski (tek) adım — MusteriAnaSayfa artık onu fotograf/arac_tipi/
 * arac_modeli/ek_detay/ihale alt adımlarına böler (geriye dönük uyum için tutulur).
 */
export type MusteriFormAdim =
  | "giris"
  | "bilgi"
  | "konum"
  | "sorun"
  | "detay"
  | "fotograf"
  | "arac_tipi"
  | "arac_modeli"
  | "arac_durumu"
  | "lastik_durumu"
  | "yakit_tipi"
  | "kilit_durumu"
  | "hareket"
  | "ek_detay"
  | "ihale"
  | "hedef"
  | "ozet"
  | "telefon";

/** Eski tek string veya yeni dizi — okurken diziye normalize edilir */
export type MusteriFormTaslak = {
  v: 1;
  step: MusteriFormAdim;
  form: MusteriFormAlanlari;
  yasalOnay: boolean;
  fotografOnizleme: string[];
  fotografData: string[];
  /** Hedef adımında «bilmiyorum sonra seçeceğim» */
  hedefBilinmiyor?: boolean;
  ihaleSureTipi?: IhaleSureTipi;
  ihaleOzelBitis?: string;
  /** Araç hareket ediyor mu */
  aracHareket?: "evet" | "hayir" | "";
  aracMarka?: string;
};

function fotografListesiOku(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.filter((x): x is string => typeof x === "string" && x.length > 0);
  }
  if (typeof v === "string" && v.length > 0) return [v];
  return [];
}

const ADIMLAR: ReadonlySet<string> = new Set([
  "giris",
  "bilgi",
  "konum",
  "sorun",
  "detay",
  "fotograf",
  "arac_tipi",
  "arac_modeli",
  "arac_durumu",
  "lastik_durumu",
  "yakit_tipi",
  "kilit_durumu",
  "hareket",
  "ek_detay",
  "ihale",
  "hedef",
  "ozet",
  "telefon",
]);

/** /b dönüşüm akışı — konum/detay (+ alt adımları) → sorun; iletişim/telefon → hedef */
export function musteriFormAdimDonusumNormalize(
  step: string
): "sorun" | "hedef" {
  if (
    step === "konum" ||
    step === "detay" ||
    step === "fotograf" ||
    step === "arac_tipi" ||
    step === "arac_modeli" ||
    step === "arac_durumu" ||
    step === "lastik_durumu" ||
    step === "yakit_tipi" ||
    step === "kilit_durumu" ||
    step === "hareket" ||
    step === "ek_detay" ||
    step === "ihale"
  ) {
    return "sorun";
  }
  if (step === "bilgi" || step === "telefon") return "hedef";
  if (step === "hedef" || step === "sorun") return step;
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
    yakitTipi: metin(f.yakitTipi),
    kilitDurumu: metin(f.kilitDurumu),
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
    const step =
      p.step === "hareket" ? ("arac_durumu" as MusteriFormAdim) : (p.step as MusteriFormAdim);
    return {
      v: 1,
      step,
      form,
      yasalOnay: p.yasalOnay === true,
      fotografOnizleme: fotografListesiOku(p.fotografOnizleme),
      fotografData: fotografListesiOku(p.fotografData),
      hedefBilinmiyor: p.hedefBilinmiyor === true,
      ihaleSureTipi: ihaleSureTipiNormalize(p.ihaleSureTipi),
      ihaleOzelBitis:
        typeof p.ihaleOzelBitis === "string" ? p.ihaleOzelBitis : undefined,
      aracHareket:
        p.aracHareket === "evet" || p.aracHareket === "hayir"
          ? p.aracHareket
          : p.aracHareket === ""
            ? ""
            : undefined,
      aracMarka: typeof p.aracMarka === "string" ? p.aracMarka : undefined,
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
  if (tam.fotografData.length || tam.fotografOnizleme.length) {
    yaz({ ...tam, fotografData: [], fotografOnizleme: [] });
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
    (t.step === "sorun" || t.step === "konum" || t.step === "giris") &&
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
    !f.yakitTipi &&
    !f.kilitDurumu &&
    !f.lat &&
    !f.lng &&
    !t.hedefBilinmiyor &&
    t.fotografData.length === 0 &&
    t.fotografOnizleme.length === 0
  );
}
