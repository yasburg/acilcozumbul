import { describe, expect, it } from "vitest";
import {
  CARK_DILIMLER,
  CARK_DILIM_SAYISI,
  carkDilimSonuc,
  carkHedefDonusDerece,
  carkOdulSmsMi,
  carkRastgeleDilimIndex,
  carkScriptliDilimIndex,
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

  it("1. deneme her zaman tekrar, 2. deneme her zaman 50 SMS", () => {
    for (let i = 0; i < 20; i++) {
      const a = carkScriptliDilimIndex(1, () => i / 20);
      expect(carkDilimSonuc(a).tip).toBe("tekrar");
      const b = carkScriptliDilimIndex(2, () => i / 20);
      expect(carkDilimSonuc(b).tip).toBe(50);
    }
  });

  it("hedef dönüş derecesi üretir", () => {
    const d = carkHedefDonusDerece(0, 5);
    expect(d).toBeGreaterThanOrEqual(5 * 360);
  });
});
