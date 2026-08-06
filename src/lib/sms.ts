import { getCekicilerBildirimAdaylari } from "./db";
import { talepSehriAcikMi } from "./cekici-sehir-acilis-db";
import {
  cekiciBildirimKrediTutari,
  cekiciPremiumSmsAktifMi,
  cekiciTalepSmsAdayiMi,
  PANEL_BILDIRIM_KREDI,
} from "./ihale";
import { sendSms, smsInfraHatasiMi, type SmsKanal } from "./sms-provider";
import {
  olusturSmsTalepKisaLink,
  smsTalepKisaUrl,
  smsTalepUzunUrl,
} from "./sms-talep-kisa-link";
import type { Cekici, Talep } from "./types";
import { telefonGecerliMi } from "./telefon";

/**
 * Yerel `next dev` / açıkça açılan modda gerçek çekicilere SMS gitmez;
 * yalnızca `testerHesap` hesaplara bildirim gider.
 * Üretimde kapalı. Zorla: SMS_TESTER_ONLY=1 | 0
 */
export function smsYalnizTesterCekicilerMi(): boolean {
  const zorla = process.env.SMS_TESTER_ONLY?.trim().toLowerCase();
  if (zorla === "1" || zorla === "true" || zorla === "evet") return true;
  if (zorla === "0" || zorla === "false" || zorla === "hayir") return false;
  return process.env.NODE_ENV === "development";
}

/** SMS konum parçası (ilçe veya il) — isim yok */
function smsTalepYer(talep: Talep): string {
  return (talep.konumIlce || talep.konumIl || "").trim();
}

/**
 * Çekici talep SMS metni (isim yok).
 * OTP max 155 — kısa link tercih edilir; link sonda korunur.
 */
export function cekiciTalepSmsMetni(
  talep: Talep,
  cekici: Cekici,
  baseUrl: string,
  yenidenArama = false,
  opts?: { link?: string }
): { mesaj: string; link: string } {
  const link =
    opts?.link?.trim() ||
    smsTalepUzunUrl(talep.id, cekici.token, baseUrl);
  const yer = smsTalepYer(talep);
  const baslik = yenidenArama
    ? "Yeni yol yardim talebi (tekrar)"
    : "Yeni yol yardim talebi";
  const onek = yer ? `${baslik}: ${yer}` : baslik;
  const mesaj = `${onek}\n${link}`;
  return { mesaj, link };
}

/** Kısa link üretir; başarısızsa uzun URL’ye düşer */
export async function cekiciTalepSmsHazirla(
  talep: Talep,
  cekici: Cekici,
  baseUrl: string,
  yenidenArama = false
): Promise<{ mesaj: string; link: string }> {
  let link = smsTalepUzunUrl(talep.id, cekici.token, baseUrl);
  try {
    const kisa = await olusturSmsTalepKisaLink({
      talepId: talep.id,
      cekiciId: cekici.id,
      cekiciToken: cekici.token,
    });
    link = smsTalepKisaUrl(kisa.token, baseUrl);
  } catch (e) {
    console.error("[sms] kısa link üretilemedi, uzun URL kullanılıyor", e);
  }
  return cekiciTalepSmsMetni(talep, cekici, baseUrl, yenidenArama, { link });
}

/**
 * Uygun çekicilere talep bildirimi.
 * - premium açık (varsayılan): OTP SMS + 2 kredi
 * - kapatılmışsa: toplu (XML) SMS + 1 kredi
 * - development / SMS_TESTER_ONLY: yalnızca tester hesaplar
 *   (otomatik kredi hatırlatma da aynı kuralı kullanır — notifyKrediHatirlatma)
 */
export async function notifyCekiciler(
  talep: Talep,
  baseUrl: string,
  haricTutulan: string[] = [],
  options?: { yenidenArama?: boolean }
): Promise<string[]> {
  if (!(await talepSehriAcikMi(talep))) {
    return [];
  }

  const tumCekiciler = await getCekicilerBildirimAdaylari(PANEL_BILDIRIM_KREDI);
  const haric = new Set(haricTutulan);
  const yeniden = options?.yenidenArama ?? false;
  const yalnizTester = smsYalnizTesterCekicilerMi();

  const adaylar = tumCekiciler.filter(
    (c) =>
      !haric.has(c.id) &&
      cekiciTalepSmsAdayiMi(talep, c) &&
      (!yalnizTester || Boolean(c.testerHesap))
  );

  if (yalnizTester && adaylar.length === 0) {
    console.info(
      "[sms] development: tester çekici adayı yok — gerçek çekicilere SMS gönderilmedi"
    );
  } else if (yalnizTester) {
    console.info(
      `[sms] development: yalnızca ${adaylar.length} tester çekiciye SMS`
    );
  }

  const bildirilenIds: string[] = [];

  await Promise.all(
    adaylar.map(async (cekici: Cekici) => {
      const tutar = cekiciBildirimKrediTutari(cekici);
      const kanal: SmsKanal = cekiciPremiumSmsAktifMi(cekici) ? "otp" : "xml";
      const { mesaj, link } = await cekiciTalepSmsHazirla(
        talep,
        cekici,
        baseUrl,
        yeniden
      );
      const sonuc = await sendSms(cekici.telefon, mesaj, {
        aliciTipi: "cekici",
        cekiciId: cekici.id,
        talepId: talep.id,
        link,
        krediMiktar: tutar,
        kanal,
      });

      if (sonuc.basarili || smsInfraHatasiMi(sonuc)) {
        bildirilenIds.push(cekici.id);
      }
    })
  );

  return bildirilenIds;
}

export type MusteriSmsTipi =
  | "talep_alindi"
  | "cekici_bulundu"
  | "yeniden_arama"
  | "anlasildi"
  | "yeni_teklif";

/** OTP kanalı kullanan müşteri SMS tipleri */
const MUSTERI_OTP_TIPLERI = new Set<MusteriSmsTipi>([
  "talep_alindi",
  "yeniden_arama",
  "yeni_teklif",
]);

/** Artık SMS gönderilmeyen tipler (çağrı no-op) */
const MUSTERI_SMS_IPTAL = new Set<MusteriSmsTipi>([
  "cekici_bulundu",
  "anlasildi",
]);

export async function notifyMusteri(
  talep: Talep,
  tip: MusteriSmsTipi,
  baseUrl: string,
  _ek?: { fiyat?: number; cekiciAd?: string }
): Promise<void> {
  if (MUSTERI_SMS_IPTAL.has(tip)) return;
  if (!telefonGecerliMi(talep.telefon)) return;

  const bekleLink = `${baseUrl.replace(/\/$/, "")}/bekle/${talep.id}`;

  // OTP 155'e sığacak ASCII metinler (link sonda)
  const mesajlar: Record<
    Exclude<MusteriSmsTipi, "cekici_bulundu" | "anlasildi">,
    string
  > = {
    talep_alindi: `acilcozumbul.com: Talebiniz alindi. Teklifleri buradan gorebilirsiniz: ${bekleLink}`,
    yeniden_arama: `acilcozumbul.com: Yeni cekici araniyor. Teklifleri buradan gorebilirsiniz: ${bekleLink}`,
    yeni_teklif: `acilcozumbul.com: Teklif geldi. Buradan gorebilirsiniz: ${bekleLink}`,
  };

  const kanal: SmsKanal = MUSTERI_OTP_TIPLERI.has(tip) ? "otp" : "xml";

  await sendSms(talep.telefon, mesajlar[tip as keyof typeof mesajlar], {
    aliciTipi: "musteri",
    talepId: talep.id,
    link: bekleLink,
    kanal,
  });
}

/** Memnuniyet formu — klasik toplu SMS */
export async function notifyMusteriMemnuniyet(
  talep: Talep,
  baseUrl: string
): Promise<void> {
  const link = `${baseUrl.replace(/\/$/, "")}/bekle/${talep.id}`;
  const mesaj = `acilcozumbul.com: Hizmeti degerlendirin. Form: ${link}`;

  await sendSms(talep.telefon, mesaj, {
    aliciTipi: "musteri",
    talepId: talep.id,
    link,
    kanal: "xml",
  });
}

/** İptal / anlaşamama — çekiciye toplu SMS (kredi düşmez) */
export async function notifyCekiciIptal(
  cekiciTelefon: string,
  cekiciId: string,
  talep: Talep
): Promise<void> {
  await sendSms(
    cekiciTelefon,
    `acilcozumbul.com: ${talep.ad} ${talep.soyad.charAt(0)}. musteri sizi tercih etmedi. Talep baska cekicilere acildi.`,
    {
      aliciTipi: "cekici",
      cekiciId,
      talepId: talep.id,
      krediDus: false,
      kanal: "xml",
    }
  );
}

/** Müşteri teklifi seçti — kazanan çekiciye bildirim (kredi düşmez) */
export async function notifyCekiciSecildi(
  cekici: Cekici,
  talep: Talep,
  baseUrl: string
): Promise<void> {
  let link = smsTalepUzunUrl(talep.id, cekici.token, baseUrl);
  try {
    const kisa = await olusturSmsTalepKisaLink({
      talepId: talep.id,
      cekiciId: cekici.id,
      cekiciToken: cekici.token,
    });
    link = smsTalepKisaUrl(kisa.token, baseUrl);
  } catch (e) {
    console.error("[sms] seçildi kısa link", e);
  }
  const yer = smsTalepYer(talep);
  const onek = yer
    ? `Musteri sizi secti (${yer})`
    : "Musteri sizi secti";
  const mesaj = `${onek}. Musteriyi arayin: ${talep.telefon}\n${link}`;
  await sendSms(cekici.telefon, mesaj, {
    aliciTipi: "cekici",
    cekiciId: cekici.id,
    talepId: talep.id,
    link,
    krediDus: false,
    kanal: "otp",
  });
}
