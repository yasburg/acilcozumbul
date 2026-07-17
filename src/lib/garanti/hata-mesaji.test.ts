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

  it("Message=Declined olsa bile 51 için yetersiz bakiye gösterir", () => {
    expect(
      garantiMusteriHataMesaji({
        respCode: "51",
        message: "Declined",
        errorMsg: "Declined",
      })
    ).toMatch(/yetersiz|limit/i);
  });

  it("bilinen kod varken spesifik olmayan banka mesajını ezmez", () => {
    expect(
      garantiMusteriHataMesaji({
        respCode: "51",
        errorMsg: "Hesap müsait değil.",
      })
    ).toMatch(/yetersiz|limit/i);
  });

  it("82 için CVV mesajı verir", () => {
    expect(
      garantiMusteriHataMesaji({
        respCode: "082",
        message: "İşleminizi gerçekleştiremiyoruz. Tekrar deneyiniz",
      })
    ).toMatch(/CVV/i);
  });

  it("bilinmeyen kod + Declined için Türkçe fallback verir", () => {
    expect(
      garantiMusteriHataMesaji({
        respCode: "77",
        message: "Declined",
      })
    ).toMatch(/reddedildi/i);
  });

  it("kod yokken spesifik Türkçe banka mesajını kullanır", () => {
    expect(
      garantiMusteriHataMesaji({
        errorMsg: "Kartınızın günlük internet alışveriş limiti dolmuştur.",
      })
    ).toMatch(/günlük internet/i);
  });
});

describe("garantiKodNormalize / genelMi", () => {
  it("kodları normalize eder", () => {
    expect(garantiKodNormalize("51")).toBe("51");
    expect(garantiKodNormalize("051")).toBe("51");
    expect(garantiKodNormalize("5")).toBe("05");
  });

  it("Declined ve genel mesajları ayırt eder", () => {
    expect(garantiMesajGenelMi("Declined")).toBe(true);
    expect(garantiMesajGenelMi("İşleminizi gerçekleştiremiyoruz.Tekrar deneyiniz")).toBe(
      true
    );
    expect(
      garantiMesajGenelMi("Kartınızın günlük internet alışveriş limiti dolmuştur.")
    ).toBe(false);
  });
});
