import { ISTANBUL_IL } from "./istanbul-ilceler";

/** Erken fazda paneli / talep akışını kullanabilen iller */
export const KULLANIMA_ACIK_ILLER = [ISTANBUL_IL] as const;

export function sehirKullanimAcikMi(sehir: string | undefined | null): boolean {
  if (!sehir?.trim()) return false;
  return (KULLANIMA_ACIK_ILLER as readonly string[]).includes(sehir.trim());
}

export function sehirBeklemeMesaji(sehir: string): string {
  return (
    `${sehir} henüz kullanıma açılmadı. Kaydınız alındı; şehriniz açılınca ` +
    `sizi bekleme listesinde önde tutacağız. O zamana kadar taleplere teklif ` +
    `veremez ve paneli kullanamazsınız.`
  );
}
