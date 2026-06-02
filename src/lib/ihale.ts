import { updateTalep } from "./db";
import { cekiciTalepBolgesineUygunMu } from "./cekici-bolge";
import { cekiciTalepSorununaUygunMu } from "./cekici-sorun";
import type { Cekici, Talep, Teklif } from "./types";

/** Çekiciye talep bildirimi SMS'i başına düşen kredi (panelde görünürlük de buna bağlı) */
export const SMS_BILDIRIM_KREDI = 1;

/** SMS gönderildi ve 1 kredi düşüldüyse true */
export function cekiciTalebeBildirildiMi(talep: Talep, cekiciId: string): boolean {
  return (talep.bildirilenCekiciIds ?? []).includes(cekiciId);
}

/** Açık ihale — bölge/sorun uygun (SMS veya manuel katılım öncesi) */
export function cekiciAcikTalepUygunMu(talep: Talep, cekici: Cekici): boolean {
  return (
    ihaleAcikMi(talep) &&
    !cekiciHaricMi(talep, cekici.id) &&
    cekiciTalepBolgesineUygunMu(cekici, talep) &&
    cekiciTalepSorununaUygunMu(cekici, talep)
  );
}
export const IHALE_SURE_DK = 60;

export function ihaleAcikMi(talep: Talep): boolean {
  if (talep.durum !== "ihalede" && talep.durum !== "yeniden_ihalede") return false;
  if (talep.kazananCekiciId) return false;
  return new Date() < new Date(talep.ihaleBitis);
}

export function cekiciTeklifVerdiMi(talep: Talep, cekiciId: string): boolean {
  return talep.teklifler?.some(
    (t) => t.cekiciId === cekiciId && t.durum !== "kaybetti"
  );
}

export function cekiciHaricMi(talep: Talep, cekiciId: string): boolean {
  return (talep.haricTutulanCekiciIds ?? []).includes(cekiciId);
}

export function cekiciTeklifVerebilirMi(talep: Talep, cekiciId: string): boolean {
  if (!ihaleAcikMi(talep)) return false;
  if (cekiciHaricMi(talep, cekiciId)) return false;
  if (cekiciTeklifVerdiMi(talep, cekiciId)) return false;
  return true;
}

export async function kaybedenTeklifleriIsaretle(
  talep: Talep,
  kazananTeklifId: string
): Promise<void> {
  for (const teklif of talep.teklifler) {
    if (teklif.id !== kazananTeklifId && teklif.durum === "aktif") {
      teklif.durum = "kaybetti";
    }
  }
  await updateTalep(talep);
}

export function aktifTeklifler(talep: Talep): Teklif[] {
  return (talep.teklifler ?? []).filter((t) => t.durum === "aktif");
}

export function enDusukTeklif(talep: Talep): Teklif | undefined {
  const aktif = aktifTeklifler(talep);
  if (!aktif.length) return undefined;
  return aktif.reduce((a, b) => (a.fiyat < b.fiyat ? a : b));
}
