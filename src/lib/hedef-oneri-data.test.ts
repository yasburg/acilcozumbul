import { describe, expect, it } from "vitest";
import { otoTamirAramaSorgusu } from "./hedef-oneri-data";

describe("otoTamirAramaSorgusu", () => {
  it("semt ve şehir ile MapsScraper tarzı sorgu üretir", () => {
    expect(
      otoTamirAramaSorgusu({ semt: "Gaziosmanpaşa", il: "İstanbul" })
    ).toBe("oto tamir Gaziosmanpaşa İstanbul Türkiye");
  });

  it("yalnız semt varsa onu kullanır", () => {
    expect(otoTamirAramaSorgusu({ semt: "Sultangazi" })).toBe(
      "oto tamir Sultangazi Türkiye"
    );
  });

  it("yalnız şehir varsa onu kullanır", () => {
    expect(otoTamirAramaSorgusu({ il: "İstanbul" })).toBe(
      "oto tamir İstanbul Türkiye"
    );
  });

  it("semt ve il aynıysa tekrarı düşer", () => {
    expect(otoTamirAramaSorgusu({ semt: "İstanbul", il: "İstanbul" })).toBe(
      "oto tamir İstanbul Türkiye"
    );
  });
});
