import { describe, expect, it } from "vitest";
import { SMS50_TEST_VARYANT } from "./sms50-kampanya";
import {
  sms50Oran,
  sms50TiklamaGunSaat,
  sms50TiklamaSatirlarindanIzgara,
} from "./sms50-tiklama-db";

describe("sms50Oran", () => {
  it("payda 0 ise null", () => {
    expect(sms50Oran(5, 0)).toBeNull();
  });

  it("oran hesaplar", () => {
    expect(sms50Oran(1, 4)).toBe(0.25);
  });
});

describe("sms50TiklamaGunSaat", () => {
  it("Istanbul saat diliminde gün/saat üretir", () => {
    /* 2026-07-22 15:30 UTC = 18:30 Europe/Istanbul (UTC+3), Çarşamba */
    const gs = sms50TiklamaGunSaat("2026-07-22T15:30:00.000Z");
    expect(gs).toEqual({ gun: 3, saat: 18 });
  });

  it("geçersiz tarihte null döner", () => {
    expect(sms50TiklamaGunSaat("not-a-date")).toBeNull();
  });
});

describe("sms50TiklamaSatirlarindanIzgara", () => {
  it("test varyantı z tıklamalarını grafikten çıkarır", () => {
    const izgara = sms50TiklamaSatirlarindanIzgara([
      { olusturulma: "2026-07-22T15:30:00.000Z", varyant: "a" },
      { olusturulma: "2026-07-22T15:30:00.000Z", varyant: SMS50_TEST_VARYANT },
      { olusturulma: "2026-07-22T15:30:00.000Z", varyant: "z" },
    ]);
    expect(izgara.toplam).toBe(1);
    expect(izgara.grid[3]![18]).toBe(1);
  });
});
