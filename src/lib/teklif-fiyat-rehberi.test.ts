import { describe, expect, it } from "vitest";
import { fiyatRehberiHesapla } from "./teklif-fiyat-rehberi";

describe("fiyat rehberi", () => {
  it("yeterli gerçek örnek olmadan öneri üretmez", () => {
    expect(fiyatRehberiHesapla([1000, 1200, 1400])).toBeNull();
  });

  it("uç fiyatlara rağmen çeyreklik aralık döndürür", () => {
    const rehber = fiyatRehberiHesapla([500, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 9999]);
    expect(rehber).toEqual({ alt: 1100, ust: 1600, medyan: 1350, ornekSayisi: 10 });
  });
});
