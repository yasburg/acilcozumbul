/** Erken faz İstanbul kontenjanı (pazarlama; kayıt bu sayıda kapanmaz) */
export const ERKEN_KAYIT_LIMIT = 100;

/** Ekranda gösterilen kayıt sayısı bu değerin altına inmez */
export const GOSTERILEN_KAYIT_TABAN = 67;

/** Ekranda gösterilen kayıt sayısı bu değeri geçmez (97+ aciliyet mesajı) */
export const GOSTERILEN_KAYIT_TAVAN = 97;

export type KayitKontenjanDurum = {
  /** Veritabanındaki gerçek kayıt sayısı */
  gercekKayit: number;
  /** Kullanıcıya gösterilen doluluk (max 97) */
  gosterilenKayit: number;
  /** Erken faz limiti */
  limit: number;
  /** Gösterilen kalan kontenjan (97+ modunda sabit 3) */
  gosterilenKalan: number;
  /** Son 3 kontenjan aciliyet metni */
  sonKontenjanModu: boolean;
};

export function kayitKontenjanHesapla(gercekKayitSayisi: number): KayitKontenjanDurum {
  const gercekKayit = Math.max(0, Math.floor(gercekKayitSayisi));
  const gosterilenKayit = Math.min(
    Math.max(gercekKayit, GOSTERILEN_KAYIT_TABAN),
    GOSTERILEN_KAYIT_TAVAN
  );
  const sonKontenjanModu = gercekKayit >= GOSTERILEN_KAYIT_TAVAN;
  const gosterilenKalan = sonKontenjanModu
    ? ERKEN_KAYIT_LIMIT - GOSTERILEN_KAYIT_TAVAN
    : Math.max(0, ERKEN_KAYIT_LIMIT - gosterilenKayit);

  return {
    gercekKayit,
    gosterilenKayit,
    limit: ERKEN_KAYIT_LIMIT,
    gosterilenKalan,
    sonKontenjanModu,
  };
}
