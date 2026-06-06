/** Yeni kayıt — davet kodu ile */
export const DAVETLI_BONUS_KREDI = 20;
/** Davet kodu sahibi — her başarılı kayıt */
export const DAVET_EDEN_BONUS_KREDI = 10;

const MIN_UZUNLUK = 4;
const MAX_UZUNLUK = 20;

const YASAKLI_KODLAR = new Set([
  "ADMIN",
  "TEST",
  "DEMO",
  "KUPON",
  "DAVET",
  "ACIL",
  "NULL",
]);

export function davetKoduNormalize(ham: string): string {
  return ham
    .trim()
    .toLocaleUpperCase("tr-TR")
    .replace(/İ/g, "I")
    .replace(/[^A-Z0-9]/g, "");
}

export function davetKoduGecerliMi(ham: string): {
  ok: boolean;
  kod?: string;
  hata?: string;
} {
  const kod = davetKoduNormalize(ham);
  if (!kod) {
    return { ok: false, hata: "Davet kodu girin." };
  }
  if (kod.length < MIN_UZUNLUK) {
    return {
      ok: false,
      hata: `Davet kodu en az ${MIN_UZUNLUK} karakter olmalı.`,
    };
  }
  if (kod.length > MAX_UZUNLUK) {
    return {
      ok: false,
      hata: `Davet kodu en fazla ${MAX_UZUNLUK} karakter olabilir.`,
    };
  }
  if (YASAKLI_KODLAR.has(kod)) {
    return { ok: false, hata: "Bu kod kullanılamaz." };
  }
  return { ok: true, kod };
}

export function davetKoduOner(ad: string): string {
  const parca = davetKoduNormalize(ad).slice(0, 8) || "DAVET";
  const rastgele = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${parca}${rastgele}`.slice(0, MAX_UZUNLUK);
}

export function davetKayitBaslangicKredisi(davetKoduVar: boolean): number {
  return davetKoduVar ? DAVETLI_BONUS_KREDI : 0;
}
