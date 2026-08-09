import { updateTalep } from "./db";
import { setKaybedenTeklifler, updateTeklifDurum } from "./teklif-db";
import { refreshCekiciPuanOzet } from "./puan-ozet-db";
import { cekiciTalepBolgesineUygunMu } from "./cekici-bolge";
import { cekiciMusaitMi } from "./cekici-musaitlik";
import { cekiciTalepSorununaUygunMu } from "./cekici-sorun";
import { cekiciToplamKredi } from "./kredi-bakiye";
import type { Cekici, Talep, Teklif } from "./types";

export type BildirimSeviye = 1 | 2 | 3;

/** 1 kredi — standart (toplu) SMS, birkaç dakika */
export const BILDIRIM_SEVIYE_STANDART: BildirimSeviye = 1;
/** 2 kredi — hızlı OTP SMS (3 sn) */
export const BILDIRIM_SEVIYE_HIZLI: BildirimSeviye = 2;
/** 3 kredi — sesli arama + hızlı SMS (önerilen / varsayılan) */
export const BILDIRIM_SEVIYE_SESLI: BildirimSeviye = 3;
export const BILDIRIM_SEVIYE_VARSAYILAN: BildirimSeviye = BILDIRIM_SEVIYE_SESLI;

/** @deprecated BILDIRIM_SEVIYE_STANDART */
export const PANEL_BILDIRIM_KREDI = BILDIRIM_SEVIYE_STANDART;
/** @deprecated BILDIRIM_SEVIYE_HIZLI */
export const PREMIUM_SMS_BILDIRIM_KREDI = BILDIRIM_SEVIYE_HIZLI;
/** Geriye uyum — panel bildirimi ile aynı */
export const SMS_BILDIRIM_KREDI = PANEL_BILDIRIM_KREDI;

export function bildirimSeviyeNormalize(raw: unknown): BildirimSeviye {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (n === 1 || n === 2 || n === 3) return n;
  return BILDIRIM_SEVIYE_VARSAYILAN;
}

/** Çekicinin bildirim paketi; yoksa varsayılan 3 (eski boolean’dan türet) */
export function cekiciBildirimSeviye(
  cekici: Pick<Cekici, "bildirimSeviye" | "premiumSmsAktif">
): BildirimSeviye {
  if (
    cekici.bildirimSeviye === 1 ||
    cekici.bildirimSeviye === 2 ||
    cekici.bildirimSeviye === 3
  ) {
    return cekici.bildirimSeviye;
  }
  if (cekici.premiumSmsAktif === false) return BILDIRIM_SEVIYE_STANDART;
  return BILDIRIM_SEVIYE_VARSAYILAN;
}

/** Hızlı SMS (OTP) — seviye 2+ */
export function cekiciBildirimHizliSmsMi(
  cekici: Pick<Cekici, "bildirimSeviye" | "premiumSmsAktif">
): boolean {
  return cekiciBildirimSeviye(cekici) >= BILDIRIM_SEVIYE_HIZLI;
}

/** Sesli arama — seviye 3 */
export function cekiciBildirimSesliMi(
  cekici: Pick<Cekici, "bildirimSeviye" | "premiumSmsAktif">
): boolean {
  return cekiciBildirimSeviye(cekici) >= BILDIRIM_SEVIYE_SESLI;
}

/** @deprecated cekiciBildirimHizliSmsMi */
export function cekiciPremiumSmsAktifMi(
  cekici: Pick<Cekici, "bildirimSeviye" | "premiumSmsAktif">
): boolean {
  return cekiciBildirimHizliSmsMi(cekici);
}

export function cekiciBildirimKrediTutari(
  cekici: Pick<Cekici, "bildirimSeviye" | "premiumSmsAktif">
): number {
  return cekiciBildirimSeviye(cekici);
}

export const BILDIRIM_SEVIYE_ETIKET: Record<
  BildirimSeviye,
  { baslik: string; aciklama: string; onerilen?: boolean }
> = {
  1: {
    baslik: "Standart SMS",
    aciklama: "Birkaç dakika içinde SMS bildirimi · 1 kredi",
  },
  2: {
    baslik: "Hızlı SMS",
    aciklama: "3 saniye içinde SMS bildirimi · 2 kredi",
  },
  3: {
    baslik: "Sesli Arama + Hızlı SMS (Önerilen)",
    aciklama: "Sesli arama ve 3 saniye içinde SMS · 3 kredi",
    onerilen: true,
  },
};

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
      cekiciToplamKredi(cekici),
      cekiciBildirimKrediTutari(cekici)
    )
  );
}
export const IHALE_SURE_DK = 60;
export const IHALE_OZEL_MAX_GUN = 30;
export const IHALE_OZEL_MIN_DK = 5;

export type IhaleSureTipi = "acil" | "1_gun" | "1_hafta" | "ozel";

export const IHALE_SURE_TIPLERI: readonly IhaleSureTipi[] = [
  "acil",
  "1_gun",
  "1_hafta",
  "ozel",
] as const;

export function ihaleSureTipiNormalize(raw: unknown): IhaleSureTipi {
  if (
    raw === "acil" ||
    raw === "1_gun" ||
    raw === "1_hafta" ||
    raw === "ozel"
  ) {
    return raw;
  }
  return "acil";
}

/** datetime-local / ISO string → Date; geçersizse null */
function ozelBitisParse(raw: string): Date | null {
  const t = raw.trim();
  if (!t) return null;
  // datetime-local: YYYY-MM-DDTHH:mm — yerel saat
  const local = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(t);
  if (local) {
    const [, y, mo, d, h, mi] = local;
    const dt = new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(h),
      Number(mi),
      0,
      0
    );
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(t);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/**
 * İhale bitiş anını hesaplar.
 * Preset’ler sunucuda yeniden hesaplanır; özel tarih istemciden gelir ve sınırlanır.
 */
export function ihaleBitisHesapla(
  tip: IhaleSureTipi,
  opts?: { ozelBitis?: string; simdi?: Date }
): { ok: true; bitis: Date } | { ok: false; hata: string } {
  const simdi = opts?.simdi ?? new Date();

  if (tip === "acil") {
    return {
      ok: true,
      bitis: new Date(simdi.getTime() + IHALE_SURE_DK * 60 * 1000),
    };
  }
  if (tip === "1_gun") {
    return {
      ok: true,
      bitis: new Date(simdi.getTime() + 24 * 60 * 60 * 1000),
    };
  }
  if (tip === "1_hafta") {
    return {
      ok: true,
      bitis: new Date(simdi.getTime() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  const bitis = ozelBitisParse(opts?.ozelBitis ?? "");
  if (!bitis) {
    return { ok: false, hata: "Özel bitiş tarihi gerekli." };
  }
  const min = new Date(simdi.getTime() + IHALE_OZEL_MIN_DK * 60 * 1000);
  const max = new Date(
    simdi.getTime() + IHALE_OZEL_MAX_GUN * 24 * 60 * 60 * 1000
  );
  if (bitis < min) {
    return {
      ok: false,
      hata: "İhale bitişi en az 5 dakika sonra olmalı.",
    };
  }
  if (bitis > max) {
    return {
      ok: false,
      hata: "İhale süresi en fazla 1 ay olabilir.",
    };
  }
  return { ok: true, bitis };
}

/** datetime-local input değeri (yerel) */
export function ihaleDatetimeLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

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
 * Acil ihale: süre ≈ 60 dk (+2 dk tolerans).
 * Tip kolonu yok; olusturulma → ihaleBitis farkından çıkarılır.
 */
export function ihaleAcilSureMi(
  talep: Pick<Talep, "olusturulma" | "ihaleBitis">
): boolean {
  const bas = new Date(talep.olusturulma).getTime();
  const bit = new Date(talep.ihaleBitis).getTime();
  if (!Number.isFinite(bas) || !Number.isFinite(bit) || bit <= bas) {
    return true;
  }
  return bit - bas <= (IHALE_SURE_DK + 2) * 60 * 1000;
}

/** Acil ihalede müşteriye OTP SMS: ilk N teklif; diğerlerinde yalnızca ilk */
export const MUSTERI_YENI_TEKLIF_SMS_ACIL_LIMIT = 3;

export function musteriYeniTeklifSmsGonderilsinMi(
  talep: Pick<Talep, "olusturulma" | "ihaleBitis" | "kazananCekiciId">,
  aktifTeklifSayisi: number
): boolean {
  if (talep.kazananCekiciId) return false;
  if (aktifTeklifSayisi < 1) return false;
  const limit = ihaleAcilSureMi(talep)
    ? MUSTERI_YENI_TEKLIF_SMS_ACIL_LIMIT
    : 1;
  return aktifTeklifSayisi <= limit;
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
