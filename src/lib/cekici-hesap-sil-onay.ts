/** Hesap silme onayında kullanıcıdan istenen metin (büyük harf) */
export const HESAP_SIL_ONAY_METNI = "HESABIMI SIL";

export function hesapSilOnayMetniGecerliMi(metin: string): boolean {
  return (
    String(metin ?? "")
      .trim()
      .toLocaleUpperCase("tr")
      .replace(/\s+/g, " ") === HESAP_SIL_ONAY_METNI
  );
}
