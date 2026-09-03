import { describe, expect, it } from "vitest";
import { adminOdemeSmsMetni } from "./admin-odeme-sms";

describe("adminOdemeSmsMetni", () => {
  it("abonelik ve kredi metinlerini ayırır", () => {
    expect(
      adminOdemeSmsMetni({ tip: "abonelik", tutarTl: 999, cekiciAd: "Yasin" })
    ).toBe("Abonelik: 999 TL — Yasin");
    expect(
      adminOdemeSmsMetni({ tip: "kredi", tutarTl: 499.4, cekiciAd: "Ali" })
    ).toBe("Kredi satın alma: 499 TL — Ali");
    expect(
      adminOdemeSmsMetni({
        tip: "abonelik_yenileme",
        tutarTl: 1999,
      })
    ).toBe("Abonelik yenileme: 1999 TL");
    expect(
      adminOdemeSmsMetni({ tip: "rozet", tutarTl: 999.9, cekiciAd: "Veli" })
    ).toBe("Doğrulanmış hesap rozeti: 1000 TL — Veli");
  });
});
