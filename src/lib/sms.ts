import { getCekiciler } from "./db";
import { filtreleCekicilerBolge } from "./cekici-bolge";
import { filtreleCekicilerSorun } from "./cekici-sorun";
import { SMS_BILDIRIM_KREDI } from "./ihale";
import { sendSms } from "./sms-provider";
import type { Cekici, Talep } from "./types";

export async function notifyCekiciler(
  talep: Talep,
  baseUrl: string,
  haricTutulan: string[] = [],
  options?: { yenidenArama?: boolean }
): Promise<string[]> {
  const tumCekiciler = await getCekiciler();
  const haric = new Set(haricTutulan);

  const bolgeVeSorunaUygun = filtreleCekicilerSorun(
    filtreleCekicilerBolge(tumCekiciler, talep),
    talep
  ).filter(
    (c) => c.aktif && !haric.has(c.id) && c.kredi >= SMS_BILDIRIM_KREDI
  );

  const bildirilenIds: string[] = [];
  const yeniden = options?.yenidenArama ?? false;

  await Promise.all(
    bolgeVeSorunaUygun.map(async (cekici: Cekici) => {
      const link = `${baseUrl}/cekici/talep/${talep.id}?t=${cekici.token}`;
      const hedef = talep.hedefKonum?.adres
        ? ` → ${talep.hedefKonum.adres.split(",").slice(0, 2).join(",")}`
        : "";
      const bolge = talep.konumIlce
        ? ` [${talep.konumIlce}]`
        : "";
      const mesaj = yeniden
        ? `${talep.ad} ${talep.soyad.charAt(0)}. müşteri yeni çekici arıyor${bolge} (${talep.konum.adres}${hedef}). Teklif: ${link}`
        : `${talep.ad} ${talep.soyad.charAt(0)}. yolda kaldı${bolge} (${talep.konum.adres}${hedef}). Teklif ver: ${link}`;

      const sonuc = await sendSms(cekici.telefon, mesaj, {
        aliciTipi: "cekici",
        cekiciId: cekici.id,
        talepId: talep.id,
        link,
      });

      if (sonuc.basarili) {
        bildirilenIds.push(cekici.id);
      }
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

/** İptal / anlaşamama — çekiciye bilgi SMS */
export async function notifyCekiciIptal(
  cekiciTelefon: string,
  cekiciId: string,
  talep: Talep
): Promise<void> {
  await sendSms(
    cekiciTelefon,
    `acilcozumbul.com: ${talep.ad} ${talep.soyad.charAt(0)}. müşteri sizi tercih etmedi. Talep başka çekicilere açıldı.`,
    { aliciTipi: "cekici", cekiciId, talepId: talep.id }
  );
}
