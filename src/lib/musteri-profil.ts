import { telefonGecerliMi, telefonNormalize } from "./telefon";

const STORAGE_KEY = "acilcozum_musteri_profil";

export type MusteriProfil = {
  telefon: string;
  ad: string;
  soyad: string;
  guncelleme: string;
};

type ProfilHaritasi = Record<string, MusteriProfil>;

function depolama(): Storage | null {
  if (typeof globalThis === "undefined") return null;
  try {
    const ls = (globalThis as { localStorage?: Storage }).localStorage;
    return ls ?? null;
  } catch {
    return null;
  }
}

function okuHarita(): ProfilHaritasi {
  const ls = depolama();
  if (!ls) return {};
  try {
    const raw = ls.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as ProfilHaritasi;
  } catch {
    return {};
  }
}

function yazHarita(harita: ProfilHaritasi): void {
  const ls = depolama();
  if (!ls) return;
  try {
    ls.setItem(STORAGE_KEY, JSON.stringify(harita));
  } catch {
    /* ignore */
  }
}

export function musteriProfilOku(telefonHam: string): MusteriProfil | null {
  if (!telefonGecerliMi(telefonHam)) return null;
  const telefon = telefonNormalize(telefonHam);
  const kayit = okuHarita()[telefon];
  if (!kayit?.ad?.trim() || !kayit?.soyad?.trim()) return null;
  return {
    telefon,
    ad: kayit.ad.trim(),
    soyad: kayit.soyad.trim(),
    guncelleme: kayit.guncelleme || "",
  };
}

/** Doğrulanmış telefon için ad/soyad sakla (kullanıcı düzenleyebilir; son değer yazılır) */
export function musteriProfilKaydet(
  telefonHam: string,
  adHam: string,
  soyadHam: string
): void {
  if (!telefonGecerliMi(telefonHam)) return;
  const ad = adHam.trim();
  const soyad = soyadHam.trim();
  if (!ad || !soyad) return;

  const telefon = telefonNormalize(telefonHam);
  const harita = okuHarita();
  harita[telefon] = {
    telefon,
    ad,
    soyad,
    guncelleme: new Date().toISOString(),
  };
  yazHarita(harita);
}
