import { describe, expect, it } from "vitest";
import type { KrediOdeme } from "../types";
import {
  bireyselEarsivTckn,
  BIREYSEL_EARSIV_VARSAYILAN_TCKN,
  faturaGunTr,
  faturaKesimTarihi,
  faturaLocalReferenceId,
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
  olusturulma: "2026-08-04T10:55:13.000Z",
};

describe("kurumsalOdemeAciklama", () => {
  it("kredi paketi açıklaması üretir", () => {
    expect(kurumsalOdemeAciklama(ornekOdeme)).toContain("750 kredi");
  });
});

describe("faturaKesimTarihi", () => {
  it("ödeme tarihini kullanır", () => {
    const d = faturaKesimTarihi(ornekOdeme, new Date("2026-08-20T12:00:00.000Z"));
    expect(d.toISOString()).toBe("2026-08-04T10:55:13.000Z");
  });

  it("Date olarak gelen olusturulma değerini kabul eder", () => {
    const d = faturaKesimTarihi(
      {
        ...ornekOdeme,
        olusturulma: new Date("2026-08-04T10:55:13.000Z") as unknown as string,
      },
      new Date("2026-08-20T12:00:00.000Z")
    );
    expect(d.toISOString()).toBe("2026-08-04T10:55:13.000Z");
  });

  it("gelecek ödemeyi bugüne çeker", () => {
    const d = faturaKesimTarihi(
      { ...ornekOdeme, olusturulma: "2099-01-01T00:00:00.000Z" },
      new Date("2026-08-20T12:00:00.000Z")
    );
    expect(d.toISOString()).toBe("2026-08-20T12:00:00.000Z");
  });
});

describe("faturaGunTr", () => {
  it("İstanbul takvim gününü verir", () => {
    // UTC 22:00 → TR 01:00 ertesi gün
    expect(faturaGunTr(new Date("2026-08-01T22:30:00.000Z"))).toBe(
      "2026-08-02"
    );
  });
});

describe("faturaLocalReferenceId", () => {
  it("banka referansını tercih eder", () => {
    expect(faturaLocalReferenceId(ornekOdeme)).toBe("REF-1");
  });

  it("referans yoksa ödeme id kullanır", () => {
    expect(
      faturaLocalReferenceId({ ...ornekOdeme, odemeReferans: undefined })
    ).toBe(ornekOdeme.id);
  });
});

describe("kisiAdiniAyir", () => {
  it("ad soyadı ayırır", () => {
    expect(kisiAdiniAyir("Ahmet Yılmaz")).toEqual({
      name: "Ahmet",
      surname: "Yılmaz",
    });
  });

  it("tek kelimede ad ve soyadı aynı tutar", () => {
    expect(kisiAdiniAyir("Ahmet")).toEqual({
      name: "Ahmet",
      surname: "Ahmet",
    });
  });
});

describe("bireyselEarsivTckn", () => {
  it("TC yoksa varsayılan TCKN kullanır", () => {
    expect(
      bireyselEarsivTckn({
        ...ornekOdeme,
        kurumsal: false,
        faturaTcKimlik: undefined,
      })
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
    expect((payload.recipientInfo as { taxId: string }).taxId).toBe(
      "1234567890"
    );
    expect(
      (payload.invoiceTotal as { payableAmount: number }).payableAmount
    ).toBe(99900);
    expect(
      (payload.recipientInfo as { surname?: string }).surname
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

  it("issuedAt ödeme tarihini kullanır", () => {
    const payload = kurumsalFaturaPayloadOlustur({
      odeme: ornekOdeme,
      companyId: 1,
      userId: 2,
      belgeTipi: "e-arsiv",
    });
    expect(payload.issuedAt).toBe("2026-08-04T10:55:13.000Z");
    expect((payload.orderInfo as { orderDate: string }).orderDate).toBe(
      "2026-08-04"
    );
    expect(payload.paymentInfo).toBeUndefined();
    expect(payload.deliveryInfo).toBeUndefined();
  });

  it("localReferenceId ve notlarda banka referansı kullanır", () => {
    const payload = kurumsalFaturaPayloadOlustur({
      odeme: ornekOdeme,
      companyId: 1,
      userId: 2,
      belgeTipi: "e-arsiv",
    });
    expect(payload.localReferenceId).toBe("REF-1");
    expect((payload.orderInfo as { orderId: string }).orderId).toBe("REF-1");
    expect(payload.notes).toEqual([
      expect.stringContaining("750 kredi"),
      "Ödeme tarihi: 2026-08-04",
      "Banka ref: REF-1",
      "Web Adresi: www.acilcozumbul.com",
    ]);
  });

  it("bireysel e-arşivde name+surname ekler", () => {
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
      name: string;
      surname: string;
      taxId: string;
    };
    expect(alici.name).toBe("Mehmet Ali");
    expect(alici.surname).toBe("Demir");
    expect(alici.taxId).toBe("10000000146");
  });
});
