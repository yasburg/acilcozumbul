import { davetKoduNormalize } from "./davet-kodu";

const MIN_UZUNLUK = 4;
const MAX_UZUNLUK = 20;

export function kampanyaKoduNormalize(ham: string): string {
  return davetKoduNormalize(ham);
}

export function kampanyaKoduGecerliMi(ham: string): {
  ok: boolean;
  kod?: string;
  hata?: string;
} {
  const kod = kampanyaKoduNormalize(ham);
  if (!kod) {
    return { ok: false, hata: "Kampanya kodu girin." };
  }
  if (kod.length < MIN_UZUNLUK) {
    return {
      ok: false,
      hata: `Kampanya kodu en az ${MIN_UZUNLUK} karakter olmalı.`,
    };
  }
  if (kod.length > MAX_UZUNLUK) {
    return {
      ok: false,
      hata: `Kampanya kodu en fazla ${MAX_UZUNLUK} karakter olabilir.`,
    };
  }
  return { ok: true, kod };
}

export interface KampanyaKodu {
  kod: string;
  yeniUyeKredi: number;
  kanal?: string;
  aciklama?: string;
  baslangic?: string;
  bitis?: string;
  maxKullanim?: number;
  kullanimSayisi: number;
  aktif: boolean;
  olusturulma: string;
}

export function kampanyaGecerliMi(
  k: KampanyaKodu,
  simdi = new Date()
): { ok: true } | { ok: false; hata: string } {
  if (!k.aktif) {
    return { ok: false, hata: "Bu kampanya kodu artık geçerli değil." };
  }
  if (k.baslangic && simdi < new Date(k.baslangic)) {
    return { ok: false, hata: "Bu kampanya henüz başlamadı." };
  }
  if (k.bitis && simdi > new Date(k.bitis)) {
    return { ok: false, hata: "Bu kampanya süresi doldu." };
  }
  if (
    k.maxKullanim != null &&
    k.maxKullanim > 0 &&
    k.kullanimSayisi >= k.maxKullanim
  ) {
    return { ok: false, hata: "Bu kampanya kodunun kullanım limiti doldu." };
  }
  return { ok: true };
}
