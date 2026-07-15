import { telefonMaskele, telefonNormalize } from "./telefon";

/** Panel ekranında kişisel veri gizleme (demo video / ekran paylaşımı) */
export const KISISEL_VERI_GIZLE_KEY = "acil_kisisel_veri_gizli";
export const KISISEL_VERI_GIZLE_EVENT = "acil-kisisel-veri-gizle";

/** yok = normal; yari = demo / sosyal medya; tam = ayarlar anahtarı */
export type GizlilikSeviye = "yok" | "yari" | "tam";

export function kisiselVeriGizliMi(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KISISEL_VERI_GIZLE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setKisiselVeriGizli(gizli: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KISISEL_VERI_GIZLE_KEY, gizli ? "1" : "0");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(KISISEL_VERI_GIZLE_EVENT));
}

/** Tam gizleme açığı öncelikli; değilse demo → yarı maske */
export function gizlilikSeviyesi(opts: {
  tamGizli?: boolean;
  demo?: boolean;
}): GizlilikSeviye {
  if (opts.tamGizli) return "tam";
  if (opts.demo) return "yari";
  return "yok";
}

function yariMetin(deger: string, gorunen = 2): string {
  const t = deger.trim();
  if (!t) return "••••";
  if (t.length <= gorunen) return `${t[0] ?? "•"}••`;
  return `${t.slice(0, gorunen)}${"•".repeat(Math.min(5, t.length - gorunen))}`;
}

export function adGoster(
  ad: string | undefined | null,
  seviye: GizlilikSeviye
): string {
  if (!ad) return seviye === "yok" ? "" : "••••";
  if (seviye === "yok") return ad;
  if (seviye === "tam") return "••••";
  return yariMetin(ad, 2);
}

export function soyadGoster(
  soyad: string | undefined | null,
  seviye: GizlilikSeviye
): string {
  if (!soyad) return seviye === "yok" ? "" : "•";
  if (seviye === "yok") return soyad;
  if (seviye === "tam") return "•";
  return `${soyad.charAt(0)}••••`;
}

/** Kartta kısaltılmış soyad gösterimi (A. veya maske) */
export function soyadKisaltGoster(
  soyad: string | undefined | null,
  seviye: GizlilikSeviye
): string {
  if (!soyad) return seviye === "yok" ? "" : "•";
  if (seviye === "yok") return `${soyad.charAt(0)}.`;
  return soyadGoster(soyad, seviye);
}

export function telefonGoster(
  telefon: string | undefined | null,
  seviye: GizlilikSeviye
): string {
  if (!telefon) return "";
  if (seviye === "yok") return telefon;
  if (seviye === "tam") return "•••• ••• •• ••";
  const n = telefonNormalize(telefon);
  if (/^05[0-9]{9}$/.test(n)) return telefonMaskele(n);
  return yariMetin(telefon.replace(/\s/g, ""), 4);
}

/**
 * Adres / bölge yarı gizle: ilk parça (max ~22), kalan •••
 * Örn. "Eski Edirne Asfaltı, …" → "Eski Edirne Asfaltı, •••"
 */
export function adresGoster(
  adres: string | undefined | null,
  seviye: GizlilikSeviye
): string {
  if (!adres) return "";
  if (seviye === "yok") return adres;
  if (seviye === "tam") return "••••••••";

  const parcalar = adres.split(",").map((p) => p.trim()).filter(Boolean);
  const ilk = parcalar[0] ?? adres.trim();
  const kisa = ilk.length > 24 ? `${ilk.slice(0, 22)}…` : ilk;
  return parcalar.length > 1 ? `${kisa}, •••` : `${yariMetin(kisa, 6)}…`;
}

/** "Ahmet Yılmaz" gibi tek satır isim */
export function adSoyadSatirGoster(
  adSoyad: string | undefined | null,
  seviye: GizlilikSeviye
): string {
  if (!adSoyad) return seviye === "yok" ? "" : "••••";
  if (seviye === "yok") return adSoyad;
  const parcalar = adSoyad.trim().split(/\s+/);
  if (parcalar.length === 1) return adGoster(parcalar[0], seviye);
  const ad = adGoster(parcalar[0], seviye);
  const soyad = soyadGoster(parcalar.slice(1).join(" "), seviye);
  return `${ad} ${soyad}`.trim();
}
