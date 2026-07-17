export type OdemeOnayKayit = {
  odemeTipi: "kredi" | "rozet";
  eklenenKredi?: number;
  toplamKredi?: number;
  tutar?: number;
};

export function odemeOnaySessionKey(odemeId: string): string {
  return `acil_odeme_onay-${odemeId}`;
}
