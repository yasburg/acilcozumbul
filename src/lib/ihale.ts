import { updateTalep } from "./db";
import type { Talep, Teklif } from "./types";

/** Çekiciye talep bildirimi SMS'i başına düşen kredi */
export const SMS_BILDIRIM_KREDI = 1;
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
