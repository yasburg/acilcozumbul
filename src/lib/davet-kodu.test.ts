import { describe, expect, it } from "vitest";
import {
  DAVET_EDEN_BONUS_KREDI,
  DAVETLI_BONUS_KREDI,
  davetKayitBaslangicKredisi,
  davetKoduGecerliMi,
  davetKoduNormalize,
  davetKoduOner,
} from "./davet-kodu";

describe("davetKoduNormalize", () => {
  it("büyük harfe çevirir ve özel karakterleri temizler", () => {
    expect(davetKoduNormalize("  ahmet-123  ")).toBe("AHMET123");
  });

  it("Türkçe İ harfini I yapar", () => {
    expect(davetKoduNormalize("İstanbul")).toBe("ISTANBUL");
  });
});

describe("davetKoduGecerliMi", () => {
  it("geçerli kod kabul eder", () => {
    expect(davetKoduGecerliMi("YASIN2024")).toEqual({
      ok: true,
      kod: "YASIN2024",
    });
  });

  it("kısa kod reddeder", () => {
    expect(davetKoduGecerliMi("AB1").ok).toBe(false);
  });

  it("yasaklı kod reddeder", () => {
    expect(davetKoduGecerliMi("ADMIN").ok).toBe(false);
  });
});

describe("davetKayitBaslangicKredisi", () => {
  it("davet kodu yoksa 0", () => {
    expect(davetKayitBaslangicKredisi(false)).toBe(0);
  });

  it("davet kodu varsa 20", () => {
    expect(davetKayitBaslangicKredisi(true)).toBe(DAVETLI_BONUS_KREDI);
  });
});

describe("davetKoduOner", () => {
  it("en az 4 karakter üretir", () => {
    const kod = davetKoduOner("Ali");
    expect(kod.length).toBeGreaterThanOrEqual(4);
    expect(davetKoduGecerliMi(kod).ok).toBe(true);
  });
});

describe("bonus sabitleri", () => {
  it("davetli 20, davet eden 10", () => {
    expect(DAVETLI_BONUS_KREDI).toBe(20);
    expect(DAVET_EDEN_BONUS_KREDI).toBe(10);
  });
});
