import { ISTANBUL_IL } from "./istanbul-ilceler";

/** Kod fallback — DB yoksa / boşsa yalnızca İstanbul */
export const KULLANIMA_ACIK_ILLER = [ISTANBUL_IL] as const;

export function sehirKullanimAcikMi(
  sehir: string | undefined | null,
  acikIller: readonly string[] = KULLANIMA_ACIK_ILLER
): boolean {
  if (!sehir?.trim()) return false;
  const n = sehir.trim();
  return acikIller.some((il) => il === n);
}

export function sehirBeklemeMesaji(sehir: string): string {
  return (
    `${sehir} henüz kullanıma açılmadı. Kaydınız alındı; şehriniz açılınca ` +
    `sizi bekleme listesinde önde tutacağız. O zamana kadar taleplere teklif ` +
    `veremez ve paneli kullanamazsınız.`
  );
}
