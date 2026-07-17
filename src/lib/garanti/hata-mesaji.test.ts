import { describe, expect, it } from "vitest";
import {
  garantiKodNormalize,
  garantiMesajGenelMi,
  garantiMusteriHataMesaji,
} from "./hata-mesaji";

describe("garantiMusteriHataMesaji", () => {
  it("51 kodunda yetersiz bakiye mesajı verir (genel ErrorMsg olsa bile)", () => {
    expect(
      garantiMusteriHataMesaji({
        respCode: "51",
        errorMsg: "İşleminizi gerçekleştiremiyoruz.Tekrar deneyiniz",
      })
    ).toMatch(/yetersiz/i);
  });

  it("spesifik banka mesajını olduğu gibi kullanır", () => {
    expect(
      garantiMusteriHataMesaji({
        respCode: "51",
        errorMsg: "Hesap müsait değil.",
      })
    ).toBe("Hesap müsait değil.");
  });

  it("82 için CVV mesajı verir", () => {
    expect(
      garantiMusteriHataMesaji({
        respCode: "082",
        message: "İşleminizi gerçekleştiremiyoruz. Tekrar deneyiniz",
      })
    ).toMatch(/CVV/i);
  });

  it("bilinmeyen kodda genel fallback kullanır", () => {
    expect(
      garantiMusteriHataMesaji({
        respCode: "77",
        errorMsg: "İşleminizi gerçekleştiremiyoruz.Tekrar deneyiniz",
      })
    ).toMatch(/reddedildi/i);
  });
});

describe("garantiKodNormalize / genelMi", () => {
  it("kodları normalize eder", () => {
    expect(garantiKodNormalize("51")).toBe("51");
    expect(garantiKodNormalize("051")).toBe("51");
    expect(garantiKodNormalize("5")).toBe("05");
  });

  it("genel mesajları ayırt eder", () => {
    expect(garantiMesajGenelMi("İşleminizi gerçekleştiremiyoruz.Tekrar deneyiniz")).toBe(
      true
    );
    expect(garantiMesajGenelMi("Hesap müsait değil.")).toBe(false);
  });
});
