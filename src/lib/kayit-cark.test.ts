import { describe, expect, it } from "vitest";
import {
  CARK_DILIMLER,
  CARK_DILIM_SAYISI,
  carkDilimSonuc,
  carkHedefDonusDerece,
  carkOdulSmsMi,
  carkRastgeleDilimIndex,
} from "./kayit-cark";

describe("kayit-cark", () => {
  it("12 dilim ve doğru dağılım", () => {
    expect(CARK_DILIMLER).toHaveLength(12);
    expect(CARK_DILIM_SAYISI).toBe(12);
    const say = (t: string | number) =>
      CARK_DILIMLER.filter((d) => d.tip === t).length;
    expect(say("tekrar")).toBe(2);
    expect(say(10)).toBe(3);
    expect(say(20)).toBe(2);
    expect(say(50)).toBe(2);
    expect(say(100)).toBe(2);
    expect(say(200)).toBe(1);
  });

  it("ödül SMS doğrular", () => {
    expect(carkOdulSmsMi(50)).toBe(true);
    expect(carkOdulSmsMi(15)).toBe(false);
  });

  it("rastgele indeks aralıkta", () => {
    for (let i = 0; i < 40; i++) {
      const idx = carkRastgeleDilimIndex(() => i / 40);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(12);
      expect(carkDilimSonuc(idx)).toBeTruthy();
    }
  });

  it("hedef dönüş derecesi üretir", () => {
    const d = carkHedefDonusDerece(0, 5);
    expect(d).toBeGreaterThanOrEqual(5 * 360);
  });
});
