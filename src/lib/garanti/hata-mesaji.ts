/** Garanti VPOS yanıt kodu → müşteriye gösterilecek metin */
const GARANTI_HATA_KODLARI: Record<string, string> = {
  "01": "Bankanız işlemi onaylamadı. Kartınızı veya bankanızı kontrol edin.",
  "02": "Bankanız işlemi onaylamadı. Kartınızı veya bankanızı kontrol edin.",
  "03": "Ödeme yapılandırması hatalı. Lütfen destek ile iletişime geçin.",
  "04": "Bu kartla işlem yapılamıyor. Bankanızla iletişime geçin.",
  "05": "İşlem banka tarafından onaylanmadı. Farklı bir kart deneyin.",
  "06": "İşlem banka tarafından reddedildi. Farklı bir kart deneyin.",
  "07": "Bu kartla işlem yapılamıyor. Bankanızla iletişime geçin.",
  "12": "Geçersiz işlem. Kart bilgilerini kontrol edip tekrar deneyin.",
  "13": "Ödeme tutarı geçersiz. Sayfayı yenileyip tekrar deneyin.",
  // 14 sıkça yanlış numara değil; limit/SKT/CVV reddinde de gelebilir
  "14":
    "Kart banka tarafından reddedildi. Kullanılabilir limit, son kullanma tarihi ve CVV’yi kontrol edin; gerekirse başka kart deneyin.",
  "15": "Kartınızın bankası bulunamadı. Farklı bir kart deneyin.",
  "16": "Kart bakiyesi veya limiti yetersiz. Yarın tekrar deneyebilir veya başka kart kullanabilirsiniz.",
  "17": "İşlem iptal edildi.",
  "18": "Kart kapalı. Bankanızla iletişime geçin veya başka kart kullanın.",
  "33": "Kartın son kullanma tarihi geçmiş. Geçerli bir kart deneyin.",
  "34": "Bu kartla işlem yapılamıyor. Bankanızla iletişime geçin.",
  "36": "Kart kısıtlı. Bankanızla iletişime geçin veya başka kart kullanın.",
  "38": "Şifre deneme limiti aşıldı. Bankanızla iletişime geçin.",
  "41": "Bu kartla işlem yapılamıyor. Bankanızla iletişime geçin.",
  "43": "Bu kartla işlem yapılamıyor. Bankanızla iletişime geçin.",
  "51": "Kart bakiyesi veya kullanılabilir limiti yetersiz. Başka bir kart deneyin.",
  "52": "Kart hesabı tanımsız. Bankanızla iletişime geçin.",
  "53": "Kart veya hesap banka tarafından reddedildi. Farklı bir kart deneyin.",
  "54": "Kartın son kullanma tarihi geçmiş. Geçerli bir kart deneyin.",
  "55": "Kart şifresi hatalı. Bankanızla iletişime geçin.",
  "56": "Kart bulunamadı. Kart numarasını kontrol edin.",
  "57": "Bu kartla bu işlem yapılamıyor. Bankanızla iletişime geçin veya başka kart kullanın.",
  "58": "Bu ödeme yöntemi şu an desteklenmiyor. Farklı bir kart deneyin.",
  "61": "Kart harcama limiti aşıldı. Limitinizi kontrol edin veya başka kart kullanın.",
  "62": "Kart kısıtlı (ör. yurt dışı kullanımı kapalı). Bankanızla iletişime geçin.",
  "65": "Günlük işlem adedi dolmuş. Yarın tekrar deneyin veya başka kart kullanın.",
  "75": "Şifre deneme limiti aşıldı. Bankanızla iletişime geçin.",
  "76": "Şifre hatalı ve deneme limiti aşıldı. Bankanızla iletişime geçin.",
  "82": "CVV (güvenlik kodu) hatalı. Kartın arkasındaki 3 haneli kodu kontrol edin.",
  "91": "Kartınızın bankası şu an yanıt vermiyor. Bir süre sonra tekrar deneyin.",
  "92": "Ödeme sistemi yapılandırması hatalı. Lütfen destek ile iletişime geçin.",
  "96": "Banka sisteminde geçici bir sorun var. Bir süre sonra tekrar deneyin.",
  "99": "Ödeme şu an tamamlanamadı. Bir süre sonra tekrar deneyin.",
};

const YETERSIZ_BAKIYE_MESAJI =
  "Kart bakiyesi veya kullanılabilir limiti yetersiz. Başka bir kart deneyin.";

const GENEL_MESAJ_ORNEKLERI = [
  "işleminizi gerçekleştiremiyoruz",
  "isleminizi gerceklestiremiyoruz",
  "tekrar deneyiniz",
  "lütfen daha sonra",
  "lutfen daha sonra",
  "general exception",
  "syserr",
  "errorid",
  "declined",
  "decline",
  "rejected",
  "failed",
  "failure",
  "error",
  "not approved",
  "notapproved",
  "do not honor",
  "deny",
  "denied",
];

const YETERSIZ_BAKIYE_ORNEKLERI = [
  "yetersiz",
  "müsait değil",
  "musait degil",
  "hesap müsait",
  "insufficient",
  "not sufficient",
  "not enough",
  "no credit",
  "over credit",
  "limit yetersiz",
  "limitiniz",
  "exceeds withdrawal",
  "exceeds limit",
];

export function garantiKodNormalize(kod: string | undefined): string {
  const digits = String(kod ?? "").replace(/\D/g, "");
  if (!digits) return "";
  const trimmed = digits.replace(/^0+/, "") || "0";
  return trimmed.padStart(2, "0").slice(-2);
}

export function garantiMesajGenelMi(mesaj: string | undefined): boolean {
  const m = (mesaj ?? "").trim().toLowerCase();
  if (!m) return true;
  if (m.length < 12) return true;
  if (GENEL_MESAJ_ORNEKLERI.some((p) => m.includes(p))) return true;
  // Tek/kısa İngilizce banka kelimeleri (Declined, Error…)
  if (/^[a-z0-9 .,_'-]+$/i.test(m) && m.split(/\s+/).length <= 3) return true;
  return false;
}

export function garantiYetersizBakiyeMetniMi(mesaj: string | undefined): boolean {
  const m = (mesaj ?? "").trim().toLowerCase();
  if (!m) return false;
  return YETERSIZ_BAKIYE_ORNEKLERI.some((p) => m.includes(p));
}

function mesajTemizle(mesaj: string): string {
  return mesaj
    .replace(/\s+/g, " ")
    .replace(/\s*\.\s*/g, ". ")
    .trim();
}

/**
 * Bankadan gelen kod + mesajlardan müşteriye gösterilecek metni seçer.
 * Bilinen yanıt kodu varsa onu önceler (Message çoğu zaman sadece “Declined”).
 * Bakiye/limit ifadesi varsa kod 14 olsa bile yetersiz bakiye mesajı verilir.
 */
export function garantiMusteriHataMesaji(input: {
  respCode?: string;
  errorMsg?: string;
  message?: string;
  sysErrMsg?: string;
  hostMsg?: string;
}): string {
  const adaylar = [
    input.errorMsg,
    input.hostMsg,
    input.sysErrMsg,
    input.message,
  ]
    .map((m) => (m ? mesajTemizle(m) : ""))
    .filter(Boolean);

  if (adaylar.some((m) => garantiYetersizBakiyeMetniMi(m))) {
    return YETERSIZ_BAKIYE_MESAJI;
  }

  const kod = garantiKodNormalize(input.respCode);
  const kodMesaji = kod ? GARANTI_HATA_KODLARI[kod] : undefined;
  if (kodMesaji) return kodMesaji;

  const spesifikBank = adaylar.find((m) => !garantiMesajGenelMi(m));
  if (spesifikBank) return spesifikBank;

  return "Ödeme banka tarafından reddedildi. Lütfen kart bilgilerinizi kontrol edin veya farklı bir kart deneyin.";
}
