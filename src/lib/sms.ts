import { getCekiciler } from "./db";
import { filtreleCekicilerBolge } from "./cekici-bolge";
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

  const bolgeyeUygun = filtreleCekicilerBolge(tumCekiciler, talep).filter(
    (c) => c.aktif && !haric.has(c.id)
  );

  const bildirilenIds: string[] = [];
  const yeniden = options?.yenidenArama ?? false;

  await Promise.all(
    bolgeyeUygun.map(async (cekici: Cekici) => {
      const link = `${baseUrl}/cekici/talep/${talep.id}?t=${cekici.token}`;
      const hedef = talep.hedefKonum?.adres
        ? ` → ${talep.hedefKonum.adres.split(",").slice(0, 2).join(",")}`
        : "";
      const bolge = talep.konumIlce
        ? ` [${talep.konumIlce}]`
        : "";
      const mesaj = yeniden
        ? `${talep.ad} ${talep.soyad.charAt(0)}. müşteri yeni çekici arıyor${bolge} (${talep.konum.adres}${hedef}). Teklif: ${link}`
        : `${talep.ad} ${talep.soyad.charAt(0)}. yolda kaldı${bolge} (${talep.konum.adres}${hedef}). Teklif ver (1 kredi): ${link}`;

      await sendSms(cekici.telefon, mesaj, {
        aliciTipi: "cekici",
        cekiciId: cekici.id,
        talepId: talep.id,
        link,
      });

      bildirilenIds.push(cekici.id);
    })
  );

  return bildirilenIds;
}

export async function notifyMusteri(
  talep: Talep,
  tip: "talep_alindi" | "cekici_bulundu" | "yeniden_arama" | "anlasildi",
  baseUrl: string
): Promise<void> {
  const bekleLink = `${baseUrl}/bekle/${talep.id}`;
  const mesajlar: Record<typeof tip, string> = {
    talep_alindi: `acilcozumbul.com: Talebiniz alındı. Çekiciler teklif verecek. Takip: ${bekleLink}`,
    cekici_bulundu: `acilcozumbul.com: Çekici seçtiniz! Kısa süre içinde sizi arayacak. Takip: ${bekleLink}`,
    yeniden_arama: `acilcozumbul.com: Yeni çekici aranıyor. Lütfen bekleyin. Takip: ${bekleLink}`,
    anlasildi: `acilcozumbul.com: Çekici ile anlaşmanız kaydedildi. İyi yolculuklar!`,
  };

  await sendSms(talep.telefon, mesajlar[tip], {
    aliciTipi: "musteri",
    talepId: talep.id,
    link: bekleLink,
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
