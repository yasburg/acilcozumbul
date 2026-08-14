import {
  cekiciAcikTalepUygunMu,
  cekiciTeklifVerdiMi,
  ihaleAcikMi,
  ihaleAcilSureMi,
} from "./ihale";
import type { Cekici, Talep } from "./types";

/** Acil (≈60 dk) değil — daha uzun ihalelerde hatırlatma */
export const IHALE_HATIRLATMA_ADIM_SAYISI = 3 as const;

export type IhaleHatirlatmaAdim = 1 | 2 | 3;

/**
 * Acil ihale değil ve ihale hâlâ açık → hatırlatma adayı.
 */
export function ihaleHatirlatmaUygunMu(
  talep: Pick<Talep, "olusturulma" | "ihaleBitis" | "durum" | "kazananCekiciId">,
  now: Date = new Date()
): boolean {
  if (!ihaleAcikMi(talep as Talep, now)) return false;
  if (ihaleAcilSureMi(talep)) return false;
  return now.getTime() < new Date(talep.ihaleBitis).getTime();
}

/**
 * 3 hatırlatma: ihale süresinin %25 / %50 / %75 anları.
 * Başlangıç ve bitişe SMS yok.
 */
export function ihaleHatirlatmaZamanlari(
  talep: Pick<Talep, "olusturulma" | "ihaleBitis">
): Record<IhaleHatirlatmaAdim, Date> {
  const bas = new Date(talep.olusturulma).getTime();
  const bit = new Date(talep.ihaleBitis).getTime();
  const sure = Math.max(0, bit - bas);
  return {
    1: new Date(bas + sure * 0.25),
    2: new Date(bas + sure * 0.5),
    3: new Date(bas + sure * 0.75),
  };
}

export function ihaleHatirlatmaAdimiVadesiGeldiMi(
  talep: Pick<Talep, "olusturulma" | "ihaleBitis">,
  adim: IhaleHatirlatmaAdim,
  now: Date = new Date()
): boolean {
  const zamanlar = ihaleHatirlatmaZamanlari(talep);
  return now.getTime() >= zamanlar[adim].getTime();
}

/** Hatırlatmada kredi şartı yok — toplu SMS paneli öder */
export function cekiciIhaleHatirlatmaAdayiMi(
  talep: Talep,
  cekici: Cekici,
  now?: Date
): boolean {
  if (!cekici.aktif) return false;
  if (cekiciTeklifVerdiMi(talep, cekici.id)) return false;
  return cekiciAcikTalepUygunMu(talep, cekici, now);
}

export function musteriIhaleHatirlatmaSmsMetni(
  talep: Pick<Talep, "id">,
  baseUrl: string
): { mesaj: string; link: string } {
  const link = `${baseUrl.replace(/\/$/, "")}/bekle/${talep.id}`;
  const mesaj = `acilcozumbul.com: Ihaleniz devam ediyor. Teklifleri kontrol edin: ${link}`;
  return { mesaj, link };
}

export function cekiciIhaleHatirlatmaSmsMetni(
  talep: Pick<Talep, "konumIl" | "konumIlce">,
  link: string
): string {
  const yer = (talep.konumIlce || talep.konumIl || "").trim();
  const onek = yer
    ? `Teklif vermediginiz acik yol yardim talebi (${yer})`
    : "Teklif vermediginiz acik yol yardim talebi";
  return `acilcozumbul.com: ${onek}.\n${link}`;
}
