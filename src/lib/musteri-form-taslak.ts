/** Ana sayfa talep formu — sekme/app değişiminde state koruması (sessionStorage) */

const STORAGE_KEY = "acilcozum_musteri_form_taslak";

export type MusteriFormAlanlari = {
  ad: string;
  soyad: string;
  telefon: string;
  lat: number;
  lng: number;
  adres: string;
  hedefLat: number;
  hedefLng: number;
  hedefAdres: string;
  sorunTipi: string;
  sorunDetay: string;
  aracModeli: string;
};

export type MusteriFormAdim =
  | "bilgi"
  | "konum"
  | "sorun"
  | "detay"
  | "hedef";

export type MusteriFormTaslak = {
  v: 1;
  step: MusteriFormAdim;
  form: MusteriFormAlanlari;
  yasalOnay: boolean;
  fotografOnizleme: string | null;
  fotografData: string | null;
  /** Hedef adımında «bilmiyorum sonra seçeceğim» */
  hedefBilinmiyor?: boolean;
};

const ADIMLAR: ReadonlySet<string> = new Set([
  "bilgi",
  "konum",
  "sorun",
  "detay",
  "hedef",
]);

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
  return {
    ad: metin(f.ad),
    soyad: metin(f.soyad),
    telefon: metin(f.telefon),
    lat: sayi(f.lat),
    lng: sayi(f.lng),
    adres: metin(f.adres),
    hedefLat: sayi(f.hedefLat),
    hedefLng: sayi(f.hedefLng),
    hedefAdres: metin(f.hedefAdres),
    sorunTipi: metin(f.sorunTipi),
    sorunDetay: metin(f.sorunDetay),
    aracModeli: metin(f.aracModeli),
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
      fotografOnizleme:
        typeof p.fotografOnizleme === "string" ? p.fotografOnizleme : null,
      fotografData: typeof p.fotografData === "string" ? p.fotografData : null,
      hedefBilinmiyor: p.hedefBilinmiyor === true,
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
  if (tam.fotografData || tam.fotografOnizleme) {
    yaz({ ...tam, fotografData: null, fotografOnizleme: null });
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
    t.step === "sorun" &&
    !t.yasalOnay &&
    !f.ad &&
    !f.soyad &&
    !f.telefon &&
    !f.adres &&
    !f.hedefAdres &&
    !f.sorunTipi &&
    !f.sorunDetay &&
    !f.aracModeli &&
    !f.lat &&
    !f.lng &&
    !t.hedefBilinmiyor &&
    !t.fotografData &&
    !t.fotografOnizleme
  );
}
