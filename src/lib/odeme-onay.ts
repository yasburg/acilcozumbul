export type OdemeOnayKayit = {
  odemeTipi: "kredi" | "rozet" | "abonelik";
  eklenenKredi?: number;
  toplamKredi?: number;
  tutar?: number;
};

export function odemeOnaySessionKey(odemeId: string): string {
  return `acil_odeme_onay-${odemeId}`;
}
