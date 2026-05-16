import type { Talep } from "./types";

export function isBugun(iso: string): boolean {
  const d = new Date(iso);
  const bugun = new Date();
  return d.toDateString() === bugun.toDateString();
}

export function talepBolge(talep: Talep): string {
  const parts = talep.konum.adres.split(",");
  return parts.slice(-2).join(",").trim() || talep.konum.adres;
}

export function talepSorunOzet(sorun: string): string {
  return sorun.length > 60 ? sorun.slice(0, 60) + "…" : sorun;
}

export function acikTalepMi(talep: Talep): boolean {
  return (
    !talep.satinAlanCekiciId &&
    (talep.durum === "beklemede" || talep.durum === "yeniden_aranıyor")
  );
}

export function cekiciHaricMi(talep: Talep, cekiciId: string): boolean {
  return (talep.haricTutulanCekiciIds ?? []).includes(cekiciId);
}

/** Bu çekici talebi satın alabilir mi? */
export function cekiciSatınAlabilirMi(talep: Talep, cekiciId: string): boolean {
  if (!acikTalepMi(talep)) return false;
  if (cekiciHaricMi(talep, cekiciId)) return false;
  return true;
}

/** Müşteri bu çekiciyi eledi mi (yeniden arama sonrası)? */
export function cekiciTercihEdilmediMi(talep: Talep, cekiciId: string): boolean {
  return cekiciHaricMi(talep, cekiciId) && acikTalepMi(talep);
}

/** Başka çekici aktif olarak tutuyor mu? */
export function baskaCekiciAktifMi(talep: Talep, cekiciId: string): boolean {
  return !!talep.satinAlanCekiciId && talep.satinAlanCekiciId !== cekiciId;
}

export function formatKredi(kredi: number): string {
  return Number.isInteger(kredi) ? String(kredi) : kredi.toFixed(1);
}
