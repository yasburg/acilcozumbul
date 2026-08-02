import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { YASAL_SIRKET } from "./yasal-sirket";
import { faturaKdvAyir } from "./fatura-link";
import type { KrediOdeme } from "./types";

/** Helvetica (WinAnsi) için Türkçe karakterleri ASCII’ye indirger */
export function faturaPdfMetin(s: string): string {
  return s
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/[^\x20-\x7E]/g, "?");
}

function tl(n: number): string {
  return (
    n.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " TL"
  );
}

export type FaturaPdfGirdi = {
  odeme: KrediOdeme;
  belgeNo: string;
  duzenlenmeTarihi?: Date;
};

/**
 * Ödeme makbuzu PDF’si üretir.
 * Yasal GİB e-Arşiv faturası değildir; arşiv / müşteri özeti amaçlıdır.
 */
export async function faturaMakbuzPdfUret(
  girdi: FaturaPdfGirdi
): Promise<Uint8Array> {
  const { odeme, belgeNo } = girdi;
  const tarih = girdi.duzenlenmeTarihi ?? new Date(odeme.olusturulma);
  const kdv = faturaKdvAyir(odeme.tutar);

  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  let y = 800;
  const line = (text: string, opts?: { bold?: boolean; size?: number }) => {
    const size = opts?.size ?? 10;
    const f = opts?.bold ? fontBold : font;
    page.drawText(faturaPdfMetin(text), {
      x: margin,
      y,
      size,
      font: f,
      color: rgb(0.1, 0.1, 0.12),
    });
    y -= size + 6;
  };

  page.drawText(faturaPdfMetin(YASAL_SIRKET.platformAdi), {
    x: margin,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0.05, 0.05, 0.08),
  });
  y -= 22;

  line("ODEME MAKBUZU / OZET BELGE", { bold: true, size: 12 });
  line(
    "(Bu belge GIB e-Arsiv / e-Fatura degildir; odeme ozeti ve arsiv kaydidir.)",
    { size: 8 }
  );
  y -= 8;

  line(`Belge No: ${belgeNo}`, { bold: true });
  line(
    `Tarih: ${tarih.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Istanbul",
    })}`
  );
  line("Para birimi: TRY");
  y -= 10;

  line("SATICI", { bold: true, size: 11 });
  line(YASAL_SIRKET.unvan, { size: 9 });
  line(`VKN: ${YASAL_SIRKET.vergiNo}`);
  line(YASAL_SIRKET.adres, { size: 9 });
  line(`E-posta: ${YASAL_SIRKET.eposta}`);
  y -= 10;

  line("ALICI", { bold: true, size: 11 });
  if (odeme.kurumsal && odeme.sirketUnvan) {
    line(odeme.sirketUnvan);
    if (odeme.vergiNo) line(`Vergi No: ${odeme.vergiNo}`);
  } else {
    line(odeme.cekiciAd);
    if (odeme.faturaTcKimlik) line(`TCKN: ${odeme.faturaTcKimlik}`);
  }
  line(`Telefon: ${odeme.cekiciTelefon}`);
  if (odeme.faturaAdres) line(`Adres: ${odeme.faturaAdres}`, { size: 9 });
  if (odeme.faturaEposta) line(`E-posta: ${odeme.faturaEposta}`);
  y -= 10;

  line("HIZMET", { bold: true, size: 11 });
  line(
    `Platform kredi paketi / abonelik — ${odeme.miktar} kredi (paket ${odeme.paketTl} TL)`
  );
  if (odeme.odemeReferans) {
    line(`Odeme referansi: ${odeme.odemeReferans}`, { size: 9 });
  }
  if (odeme.demoOdeme) {
    line("Not: Demo odeme kaydi", { size: 9 });
  }
  y -= 10;

  line("TUTARLAR", { bold: true, size: 11 });
  line(`Matrah (KDV haric): ${tl(kdv.matrah)}`);
  line(`KDV (%${Math.round(kdv.oran * 100)}): ${tl(kdv.kdv)}`);
  line(`Genel toplam: ${tl(kdv.toplam)}`, { bold: true, size: 12 });

  y = 72;
  page.drawText(
    faturaPdfMetin(
      `${YASAL_SIRKET.platformDomain} — Belge arsiv no: ${belgeNo}`
    ),
    {
      x: margin,
      y,
      size: 8,
      font,
      color: rgb(0.45, 0.45, 0.5),
    }
  );

  return doc.save();
}
