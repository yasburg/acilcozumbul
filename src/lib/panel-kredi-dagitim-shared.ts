/** İstemci ve sunucunun ortak kullandığı, veritabanı bağımlılığı olmayan kredi dağıtım değerleri. */
export const KREDI_TANIM_PH = "{kredi}";
export const KREDI_TANIM_SABLON_GOVDE =
  `Hesabiniza ${KREDI_TANIM_PH} kredi tanimlanmistir. Iyi gunler, iyi calismalar.`;

export type KrediDagitimUcDurum = "hepsi" | "evet" | "hayir";

export function krediTanimSmsMesaji(
  kredi: number,
  sablonGovde = KREDI_TANIM_SABLON_GOVDE
): string {
  const miktar = Math.max(0, Math.floor(Number(kredi) || 0));
  return sablonGovde.split(KREDI_TANIM_PH).join(String(miktar)).trim();
}
