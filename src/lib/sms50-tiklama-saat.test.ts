import { describe, expect, it } from "vitest";
import { sms50TiklamaGunSaat } from "./sms50-tiklama-db";

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
