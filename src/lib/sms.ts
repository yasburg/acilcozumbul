import { getCekiciler } from "./db";
import { sendSms } from "./sms-provider";
import type { Talep } from "./types";

function extractSehir(adres: string): string {
  const lower = adres.toLowerCase();
  if (lower.includes("istanbul") || lower.includes("İstanbul".toLowerCase()))
    return "İstanbul";
  if (lower.includes("ankara")) return "Ankara";
  if (lower.includes("izmir")) return "İzmir";
  return "";
}

export async function notifyCekiciler(
  talep: Talep,
  baseUrl: string,
  haricTutulan: string[] = [],
  options?: { yenidenArama?: boolean }
): Promise<string[]> {
  const sehir = extractSehir(talep.konum.adres);
  const tumCekiciler = await getCekiciler();
  const haric = new Set(haricTutulan);
  const hedefler = tumCekiciler.filter(
    (c) =>
      c.aktif &&
      !haric.has(c.id) &&
      (!sehir || c.sehir === sehir)
  );
  const kullanilacak =
    hedefler.length > 0
      ? hedefler
      : tumCekiciler.filter((c) => c.aktif && !haric.has(c.id));

  const bildirilenIds: string[] = [];
  const yeniden = options?.yenidenArama ?? false;

  await Promise.all(
    kullanilacak.map(async (cekici) => {
      const link = `${baseUrl}/cekici/talep/${talep.id}?t=${cekici.token}`;
      const mesaj = yeniden
        ? `${talep.ad} ${talep.soyad.charAt(0)}. müşteri yeni bir çekici arıyor (${talep.konum.adres}). Bilgilere ulaşmak için linke tıklayın: ${link}`
        : `${talep.ad} ${talep.soyad.charAt(0)}. isimli kişi ${talep.konum.adres}'da yolda kaldı. Bilgilere ulaşmak için linke tıklayın: ${link}`;

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
    talep_alindi: `acilcozumbul.com: Talebiniz alındı. Yakındaki çekicilere bildirim gönderildi. Takip: ${bekleLink}`,
    cekici_bulundu: `acilcozumbul.com: Çekici bulundu! Kısa süre içinde sizi arayacak. Takip: ${bekleLink}`,
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
