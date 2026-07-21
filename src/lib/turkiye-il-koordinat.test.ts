import { describe, expect, it } from "vitest";
import {
  haritaYaricapLog,
  ilKoordinatBul,
  TURKIYE_IL_KOORDINAT,
} from "./turkiye-il-koordinat";
import { DESTEKLENEN_ILLER } from "./il-ilce";

describe("turkiye-il-koordinat", () => {
  it("81 ilin koordinatı var", () => {
    expect(Object.keys(TURKIYE_IL_KOORDINAT)).toHaveLength(81);
    for (const il of DESTEKLENEN_ILLER) {
      expect(ilKoordinatBul(il), il).not.toBeNull();
    }
  });

  it("logaritmik yarıçap aşırı büyümez", () => {
    const r1 = haritaYaricapLog(1, 1000);
    const r10 = haritaYaricapLog(10, 1000);
    const r100 = haritaYaricapLog(100, 1000);
    const r1000 = haritaYaricapLog(1000, 1000);
    expect(r1).toBeLessThan(r10);
    expect(r10).toBeLessThan(r100);
    expect(r100).toBeLessThan(r1000);
    /* 100→1000 (10×) doğrusal olsaydı yarıçap farkı çok büyürdü; log sıkıştırır */
    expect(r1000 - r100).toBeLessThan(r100 - r1);
    expect(r1000).toBe(36);
  });

  it("her şehir için tek harita noktası döner", async () => {
    const mod = await import("./turkiye-il-koordinat");
    expect(mod.haritaSehirNoktalari("İstanbul")).toHaveLength(1);
    expect(mod.haritaSehirNoktalari("Bursa")).toHaveLength(1);
  });
});
