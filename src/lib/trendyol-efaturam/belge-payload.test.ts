import { describe, expect, it } from "vitest";
import type { KrediOdeme } from "../types";
import {
  bireyselEarsivTckn,
  BIREYSEL_EARSIV_VARSAYILAN_TCKN,
  kisiAdiniAyir,
  kurumsalFaturaPayloadOlustur,
  kurumsalOdemeAciklama,
} from "./belge-payload";
import { faturaBelgeTipiBelirle } from "./mukellef";

const ornekOdeme: KrediOdeme = {
  id: "odeme-test-12345678901234567890123456789012",
  cekiciId: "cekici-1",
  cekiciAd: "Test Çekici",
  cekiciTelefon: "+905551234567",
  miktar: 750,
  tutar: 999,
  paketTl: 999,
  odemeTipi: "kredi",
  faturaEposta: "muhasebe@ornek.com",
  faturaAdres: "Kadikoy Istanbul",
  kurumsal: true,
  sirketUnvan: "Ornek Tasimacilik Ltd.",
  vergiNo: "1234567890",
  odemeReferans: "REF-1",
  demoOdeme: false,
  olusturulma: "2026-08-19T12:00:00.000Z",
};

describe("kurumsalOdemeAciklama", () => {
  it("kredi paketi açıklaması üretir", () => {
    expect(kurumsalOdemeAciklama(ornekOdeme)).toContain("750 kredi");
  });
});

describe("kisiAdiniAyir", () => {
  it("ad soyadı ayırır", () => {
    expect(kisiAdiniAyir("Ahmet Yılmaz")).toEqual({
      firstName: "Ahmet",
      familyName: "Yılmaz",
    });
  });

  it("tek kelimede ad ve soyadı aynı tutar", () => {
    expect(kisiAdiniAyir("Ahmet")).toEqual({
      firstName: "Ahmet",
      familyName: "Ahmet",
    });
  });
});

describe("bireyselEarsivTckn", () => {
  it("TC yoksa varsayılan TCKN kullanır", () => {
    expect(
      bireyselEarsivTckn({ ...ornekOdeme, kurumsal: false, faturaTcKimlik: undefined })
    ).toBe(BIREYSEL_EARSIV_VARSAYILAN_TCKN);
  });
});

describe("kurumsalFaturaPayloadOlustur", () => {
  it("e-fatura için TEMELFATURA ve targetAlias kullanır", () => {
    const payload = kurumsalFaturaPayloadOlustur({
      odeme: ornekOdeme,
      companyId: 10,
      userId: 20,
      belgeTipi: faturaBelgeTipiBelirle({ kurumsal: true, mukellef: true }),
      targetAlias: "urn:mail:pk@efatura.gov.tr",
    });

    expect(payload.companyId).toBe(10);
    expect(payload.userId).toBe(20);
    expect(payload.targetAlias).toBe("urn:mail:pk@efatura.gov.tr");
    expect((payload.invoiceInfo as { invoiceType: string }).invoiceType).toBe(
      "TEMELFATURA"
    );
    expect(
      (payload.recipientInfo as { taxId: string }).taxId
    ).toBe("1234567890");
    expect(
      (payload.invoiceTotal as { payableAmount: number }).payableAmount
    ).toBe(99900);
    expect(
      (payload.recipientInfo as { firstName?: string }).firstName
    ).toBeUndefined();
  });

  it("e-arşiv için EARSIVFATURA kullanır", () => {
    const payload = kurumsalFaturaPayloadOlustur({
      odeme: ornekOdeme,
      companyId: 1,
      userId: 2,
      belgeTipi: "e-arsiv",
    });
    expect((payload.invoiceInfo as { invoiceType: string }).invoiceType).toBe(
      "EARSIVFATURA"
    );
    expect(payload.targetAlias).toBeUndefined();
  });

  it("bireysel e-arşivde FirstName/FamilyName ekler", () => {
    const payload = kurumsalFaturaPayloadOlustur({
      odeme: {
        ...ornekOdeme,
        kurumsal: false,
        cekiciAd: "Mehmet Ali Demir",
        sirketUnvan: undefined,
        vergiNo: undefined,
        faturaTcKimlik: "10000000146",
      },
      companyId: 1,
      userId: 2,
      belgeTipi: "e-arsiv",
    });
    const alici = payload.recipientInfo as {
      firstName: string;
      familyName: string;
      taxId: string;
    };
    expect(alici.firstName).toBe("Mehmet Ali");
    expect(alici.familyName).toBe("Demir");
    expect(alici.taxId).toBe("10000000146");
  });
});
