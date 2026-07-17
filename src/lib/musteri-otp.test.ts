import { describe, expect, it } from "vitest";
import {
  ayniIstanbulGunuMu,
  istanbulGunAnahtari,
  istanbulGunSonunaKalanSn,
} from "./musteri-otp";

describe("istanbul gün yardımcıları", () => {
  it("aynı İstanbul gününü tanır", () => {
    const bugun = istanbulGunAnahtari();
    expect(ayniIstanbulGunuMu(new Date().toISOString())).toBe(true);
    expect(ayniIstanbulGunuMu(`${bugun}T12:00:00+03:00`)).toBe(true);
  });

  it("önceki günü reddeder", () => {
    const dun = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();
    // 36 saat önce çoğu zaman farklı gündür; kesin için sabit dene
    expect(ayniIstanbulGunuMu("2020-01-01T12:00:00+03:00")).toBe(false);
    void dun;
  });

  it("gün sonuna kalan süre makul aralıkta", () => {
    const sn = istanbulGunSonunaKalanSn();
    expect(sn).toBeGreaterThanOrEqual(60);
    expect(sn).toBeLessThanOrEqual(24 * 60 * 60);
  });
});
