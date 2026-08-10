/**
 * Aynı cihazda açık talebe dönüş — localStorage’da aktif talep id.
 */

export const MUSTERI_AKTIF_TALEP_KEY = "acil_musteri_aktif_talep";

/** Ana sayfadan /bekle’ye yönlendirilecek durumlar */
export function musteriTalepDevamEdilir(
  durum: string | null | undefined
): boolean {
  return (
    durum === "ihalede" ||
    durum === "yeniden_ihalede" ||
    durum === "kazanan_belli" ||
    durum === "anlaşıldı"
  );
}

export function musteriAktifTalepOku(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(MUSTERI_AKTIF_TALEP_KEY)?.trim();
    return v || null;
  } catch {
    return null;
  }
}

export function musteriAktifTalepKaydet(talepId: string): void {
  const id = talepId.trim();
  if (!id || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MUSTERI_AKTIF_TALEP_KEY, id);
  } catch {
    /* private mode */
  }
}

export function musteriAktifTalepSil(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(MUSTERI_AKTIF_TALEP_KEY);
  } catch {
    /* ignore */
  }
}

/** Kayıtlı id bu talepse sil (iptal / yeni talep) */
export function musteriAktifTalepTemizleEger(talepId: string): void {
  const id = talepId.trim();
  if (!id) return;
  if (musteriAktifTalepOku() === id) musteriAktifTalepSil();
}
