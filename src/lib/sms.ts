import { getCekiciById, getCekiciler, updateCekici } from "./db";
import {
  cekiciBildirimKrediTutari,
  cekiciTalepSmsAdayiMi,
  cekiciYeterliBildirimKredisi,
} from "./ihale";
import { sendSms, smsInfraHatasiMi } from "./sms-provider";
import type { Cekici, Talep } from "./types";

/**
 * Premium talep OTP SMS metni.
 * Netgsm OTP max 155 karakter — tam adres yok; ihale linki her zaman sonda tam kalır.
 */
export function cekiciTalepSmsMetni(
  talep: Talep,
  cekici: Cekici,
  baseUrl: string,
  yenidenArama = false
): { mesaj: string; link: string } {
  const link = `${baseUrl.replace(/\/$/, "")}/cekici/talep/${talep.id}?t=${cekici.token}`;
  // Sadece ilçe (veya il) — tam adres OTP 155 limitinde linki keserdi
  const yer = talep.konumIlce || talep.konumIl || "";
  const yerParca = yer ? ` [${yer}]` : "";
  const kim = `${talep.ad} ${talep.soyad.charAt(0)}.`;
  const mesaj = yenidenArama
    ? `${kim} yeni cekici ariyor${yerParca}. Teklif: ${link}`
    : `${kim} yolda kaldi${yerParca}. Teklif: ${link}`;
  return { mesaj, link };
}

/**
 * Uygun çekicilere talep bildirimi.
 * - premiumSmsAktif: anlık SMS + 2 kredi
 * - değilse: yalnızca panel açılışı + 1 kredi (SMS yok)
 */
export async function notifyCekiciler(
  talep: Talep,
  baseUrl: string,
  haricTutulan: string[] = [],
  options?: { yenidenArama?: boolean }
): Promise<string[]> {
  const tumCekiciler = await getCekiciler();
  const haric = new Set(haricTutulan);
  const yeniden = options?.yenidenArama ?? false;

  const adaylar = tumCekiciler.filter(
    (c) => !haric.has(c.id) && cekiciTalepSmsAdayiMi(talep, c)
  );

  const bildirilenIds: string[] = [];

  await Promise.all(
    adaylar.map(async (cekici: Cekici) => {
      const tutar = cekiciBildirimKrediTutari(cekici);

      if (cekici.premiumSmsAktif) {
        const { mesaj, link } = cekiciTalepSmsMetni(
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
          kanal: "otp",
        });

        if (sonuc.basarili || smsInfraHatasiMi(sonuc)) {
          bildirilenIds.push(cekici.id);
        }
        return;
      }

      // Standart: panel bildirimi, SMS yok
      const guncel = await getCekiciById(cekici.id);
      if (!guncel || !cekiciYeterliBildirimKredisi(guncel.kredi, tutar)) {
        return;
      }
      guncel.kredi -= tutar;
      await updateCekici(guncel);
      bildirilenIds.push(cekici.id);
    })
  );

  return bildirilenIds;
}

export async function notifyMusteri(
  talep: Talep,
  tip:
    | "talep_alindi"
    | "cekici_bulundu"
    | "yeniden_arama"
    | "anlasildi"
    | "yeni_teklif",
  baseUrl: string,
  ek?: { fiyat?: number; cekiciAd?: string }
): Promise<void> {
  const bekleLink = `${baseUrl}/bekle/${talep.id}`;
  const mesajlar: Record<typeof tip, string> = {
    talep_alindi: `acilcozumbul.com: Talebiniz alındı. Çekiciler teklif verecek. Takip: ${bekleLink}`,
    cekici_bulundu: `acilcozumbul.com: Çekici seçtiniz! Kısa süre içinde sizi arayacak. Takip: ${bekleLink}`,
    yeniden_arama: `acilcozumbul.com: Yeni çekici aranıyor. Lütfen bekleyin. Takip: ${bekleLink}`,
    anlasildi: `acilcozumbul.com: Çekici ile anlaşmanız kaydedildi. İyi yolculuklar!`,
    yeni_teklif: `acilcozumbul.com: Yeni teklif: ${ek?.fiyat ?? "?"} TL (${ek?.cekiciAd ?? "Çekici"}). Seçmek için: ${bekleLink}`,
  };

  await sendSms(talep.telefon, mesajlar[tip], {
    aliciTipi: "musteri",
    talepId: talep.id,
    link: bekleLink,
  });
}

/** Memnuniyet formu açıldığında müşteriye link */
export async function notifyMusteriMemnuniyet(
  talep: Talep,
  baseUrl: string
): Promise<void> {
  const link = `${baseUrl}/bekle/${talep.id}`;
  const mesaj = `acilcozumbul.com: Hizmeti değerlendirin (genel memnuniyet, fiyat ve varış süresi). Form: ${link}`;

  await sendSms(talep.telefon, mesaj, {
    aliciTipi: "musteri",
    talepId: talep.id,
    link,
  });
}

/** İptal / anlaşamama — çekiciye bilgi SMS (premium değil; kredi düşmez) */
export async function notifyCekiciIptal(
  cekiciTelefon: string,
  cekiciId: string,
  talep: Talep
): Promise<void> {
  await sendSms(
    cekiciTelefon,
    `acilcozumbul.com: ${talep.ad} ${talep.soyad.charAt(0)}. müşteri sizi tercih etmedi. Talep başka çekicilere açıldı.`,
    { aliciTipi: "cekici", cekiciId, talepId: talep.id, krediDus: false }
  );
}
