import { describe, expect, it } from "vitest";
import {
  dogumAyGunSayisi,
  dogumParcalarindanIso,
  dogumTarihiDogrula,
  dogumTarihiMaxIso,
  dogumTarihiMinIso,
  dogumYilSecenekleri,
} from "./dogum-tarihi";

describe("dogumTarihiDogrula", () => {
  it("boş reddeder", () => {
    expect(dogumTarihiDogrula("").ok).toBe(false);
    expect(dogumTarihiDogrula(null).ok).toBe(false);
  });

  it("geçerli yetişkin tarihi kabul eder", () => {
    const max = dogumTarihiMaxIso();
    const r = dogumTarihiDogrula(max);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.deger).toBe(max);
  });

  it("18 yaşından küçükleri reddeder", () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 17);
    const iso = d.toISOString().slice(0, 10);
    const r = dogumTarihiDogrula(iso);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.hata).toMatch(/18/);
  });

  it("min/max iso aralığı tutarlı", () => {
    expect(dogumTarihiMinIso() < dogumTarihiMaxIso()).toBe(true);
  });
});

describe("dogum parça seçicileri", () => {
  it("parçalardan ISO üretir", () => {
    expect(dogumParcalarindanIso(3, 5, 2000)).toBe("2000-05-03");
    expect(dogumParcalarindanIso("", 5, 2000)).toBe("");
  });

  it("Şubat gün sayısını hesaplar", () => {
    expect(dogumAyGunSayisi(2024, 2)).toBe(29);
    expect(dogumAyGunSayisi(2023, 2)).toBe(28);
  });

  it("yıl listesi yeniden eskiye", () => {
    const yillar = dogumYilSecenekleri();
    expect(yillar[0]).toBeGreaterThan(yillar[yillar.length - 1]);
  });
});
