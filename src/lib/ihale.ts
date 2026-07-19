import { updateTalep } from "./db";
import { setKaybedenTeklifler, updateTeklifDurum } from "./teklif-db";
import { refreshCekiciPuanOzet } from "./puan-ozet-db";
import { cekiciTalepBolgesineUygunMu } from "./cekici-bolge";
import { cekiciMusaitMi } from "./cekici-musaitlik";
import { cekiciTalepSorununaUygunMu } from "./cekici-sorun";
import type { Cekici, Talep, Teklif } from "./types";

/** Panel bildirimi (SMS yok) başına kredi */
export const PANEL_BILDIRIM_KREDI = 1;
/** Premium anlık SMS bildirimi başına kredi */
export const PREMIUM_SMS_BILDIRIM_KREDI = 2;
/** Geriye uyum — panel bildirimi ile aynı */
export const SMS_BILDIRIM_KREDI = PANEL_BILDIRIM_KREDI;

export function cekiciBildirimKrediTutari(cekici: Pick<Cekici, "premiumSmsAktif">): number {
  return cekici.premiumSmsAktif
    ? PREMIUM_SMS_BILDIRIM_KREDI
    : PANEL_BILDIRIM_KREDI;
}

export function cekiciYeterliBildirimKredisi(
  kredi: number,
  tutar: number = PANEL_BILDIRIM_KREDI
): boolean {
  return Number(kredi) >= tutar - 1e-9;
}

/** Talebe bildirildi (panel açıldı / SMS gitti) */
export function cekiciTalebeBildirildiMi(talep: Talep, cekiciId: string): boolean {
  return (talep.bildirilenCekiciIds ?? []).includes(cekiciId);
}

/** Açık ihale — bölge/sorun/müsaitlik uygun */
export function cekiciAcikTalepUygunMu(
  talep: Talep,
  cekici: Cekici,
  now?: Date
): boolean {
  return (
    ihaleAcikMi(talep) &&
    !cekiciHaricMi(talep, cekici.id) &&
    cekiciTalepBolgesineUygunMu(cekici, talep) &&
    cekiciTalepSorununaUygunMu(cekici, talep) &&
    cekiciMusaitMi(cekici, now)
  );
}

/** Otomatik talep bildirimi adayı (kredi + uygunluk) */
export function cekiciTalepSmsAdayiMi(talep: Talep, cekici: Cekici): boolean {
  return (
    cekici.aktif &&
    cekiciAcikTalepUygunMu(talep, cekici) &&
    cekiciYeterliBildirimKredisi(
      cekici.kredi,
      cekiciBildirimKrediTutari(cekici)
    )
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
  try {
    await updateTeklifDurum(kazananTeklifId, "kazandi");
    await setKaybedenTeklifler(talep.id, kazananTeklifId);
    const kazanan = talep.teklifler.find((t) => t.id === kazananTeklifId);
    if (kazanan) await refreshCekiciPuanOzet(kazanan.cekiciId);
    for (const t of talep.teklifler) {
      if (t.id !== kazananTeklifId && t.cekiciId !== kazanan?.cekiciId) {
        await refreshCekiciPuanOzet(t.cekiciId).catch(() => {});
      }
    }
  } catch (e) {
    const code = e && typeof e === "object" && "code" in e ? String(e.code) : "";
    if (code !== "42P01" && code !== "PGRST205") throw e;
  }
}

export function aktifTeklifler(talep: Talep): Teklif[] {
  return (talep.teklifler ?? []).filter((t) => t.durum === "aktif");
}

/**
 * Anlaşılamayan kazananı hariç tutar; diğer teklifleri tekrar aktif eder.
 * Kalan teklif varsa aynı ihaleye devam; yoksa yeniden ihale açılır.
 */
export function anlasamadiSonrasiIhaleyiSurdur(
  talep: Talep,
  reddedilenCekiciId: string,
  simdi: Date = new Date()
): { kalanAktif: number } {
  const haric = [...(talep.haricTutulanCekiciIds ?? [])];
  if (!haric.includes(reddedilenCekiciId)) haric.push(reddedilenCekiciId);
  talep.haricTutulanCekiciIds = haric;

  for (const teklif of talep.teklifler ?? []) {
    if (
      teklif.cekiciId === reddedilenCekiciId ||
      haric.includes(teklif.cekiciId)
    ) {
      teklif.durum = "kaybetti";
      continue;
    }
    if (teklif.durum === "kaybetti" || teklif.durum === "kazandi") {
      teklif.durum = "aktif";
    }
  }

  talep.kazananCekiciId = undefined;
  talep.kazananTeklifId = undefined;
  talep.anlasmaDurumu = "bekliyor";

  const kalanAktif = aktifTeklifler(talep).length;
  const bitisGecmis = new Date(talep.ihaleBitis) <= simdi;

  if (kalanAktif > 0) {
    talep.durum = "ihalede";
    if (bitisGecmis) {
      talep.ihaleBitis = new Date(
        simdi.getTime() + IHALE_SURE_DK * 60 * 1000
      ).toISOString();
    }
  } else {
    talep.durum = "yeniden_ihalede";
    talep.ihaleBitis = new Date(
      simdi.getTime() + IHALE_SURE_DK * 60 * 1000
    ).toISOString();
  }

  return { kalanAktif };
}

export function enDusukTeklif(talep: Talep): Teklif | undefined {
  const aktif = aktifTeklifler(talep);
  if (!aktif.length) return undefined;
  return aktif.reduce((a, b) => (a.fiyat < b.fiyat ? a : b));
}
