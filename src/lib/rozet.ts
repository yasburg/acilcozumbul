/** Onaylı çekici rozeti — belge onayı sonrası tek seferlik satın alma */
export const ROZET_LISTE_FIYAT_TL = 2490;
export const ROZET_INDIRIMLI_FIYAT_TL = 999.9;

export function rozetIndirimYuzde(): number {
  return Math.round(
    (1 - ROZET_INDIRIMLI_FIYAT_TL / ROZET_LISTE_FIYAT_TL) * 100
  );
}
