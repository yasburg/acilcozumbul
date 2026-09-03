import { sendSms } from "./sms-provider";
import { TOPLU_SMS_ADMIN_TEST_TELEFON } from "./toplu-sms-admin-test";

export type AdminOdemeSmsTip =
  | "abonelik"
  | "abonelik_yenileme"
  | "kredi"
  | "rozet";

export function adminOdemeSmsMetni(opts: {
  tip: AdminOdemeSmsTip;
  tutarTl: number;
  cekiciAd?: string;
}): string {
  const tutar = Math.round(Number(opts.tutarTl) || 0);
  const tipMetin =
    opts.tip === "abonelik"
      ? "Abonelik"
      : opts.tip === "abonelik_yenileme"
        ? "Abonelik yenileme"
        : opts.tip === "rozet"
          ? "Doğrulanmış hesap rozeti"
          : "Kredi satın alma";
  const ad = (opts.cekiciAd ?? "").trim();
  const kim = ad ? ` — ${ad}` : "";
  return `${tipMetin}: ${tutar} TL${kim}`;
}

/**
 * Kredi / abonelik tahsilatında admin telefonuna XML (toplu SMS paketi) bildirimi.
 * Ödeme akışını bozmamak için hatalar yutulur.
 */
export async function adminOdemeSmsGonder(opts: {
  tip: AdminOdemeSmsTip;
  tutarTl: number;
  cekiciAd?: string;
}): Promise<boolean> {
  const mesaj = adminOdemeSmsMetni(opts);
  try {
    const sonuc = await sendSms(TOPLU_SMS_ADMIN_TEST_TELEFON, mesaj, {
      aliciTipi: "musteri",
      krediDus: false,
      kanal: "xml",
    });
    if (!sonuc.basarili) {
      console.error("[admin-odeme-sms]", sonuc.hata);
    }
    return sonuc.basarili;
  } catch (e) {
    console.error("[admin-odeme-sms]", e);
    return false;
  }
}
