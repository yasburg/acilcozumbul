import { describe, expect, it } from "vitest";
import { faturaMakbuzPdfUret, faturaPdfMetin } from "./fatura-pdf";
import { faturaPdfBufferGecerliMi } from "./fatura-storage";
import type { KrediOdeme } from "./types";

const ornekOdeme: KrediOdeme = {
  id: "odeme-1",
  cekiciId: "cekici-1",
  cekiciAd: "Ahmet Yılmaz",
  cekiciTelefon: "05321112233",
  miktar: 50,
  tutar: 999,
  paketTl: 999,
  faturaEposta: "a@example.com",
  faturaAdres: "İstanbul",
  kurumsal: false,
  demoOdeme: true,
  odemeReferans: "REF123",
  olusturulma: "2026-08-01T10:00:00.000Z",
};

describe("faturaPdfMetin", () => {
  it("Türkçe karakterleri WinAnsi uyumlu hale getirir", () => {
    expect(faturaPdfMetin("ŞğİıÖöÜüÇç")).toBe("SgIiOoUuCc");
  });
});

describe("faturaMakbuzPdfUret", () => {
  it("geçerli PDF buffer üretir", async () => {
    const bytes = await faturaMakbuzPdfUret({
      odeme: ornekOdeme,
      belgeNo: "ACB-20260801-ABCDEF12",
    });
    expect(bytes.byteLength).toBeGreaterThan(500);
    const buf = Buffer.from(bytes);
    expect(faturaPdfBufferGecerliMi(buf)).toBe(true);
  });

  it("özel kalem açıklamasını kabul eder", async () => {
    const bytes = await faturaMakbuzPdfUret({
      odeme: { ...ornekOdeme, odemeTipi: "rozet", miktar: 0 },
      belgeNo: "ORNEK-TEST",
      kalemAciklama: "Acil Cozum Bul dogrulanmis hesap rozeti paketi",
      duzenlenmeTarihi: new Date("2026-08-30T12:00:00+03:00"),
    });
    expect(faturaPdfBufferGecerliMi(Buffer.from(bytes))).toBe(true);
  });
});
