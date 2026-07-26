import { describe, expect, it } from "vitest";
import { SMS50_TEST_VARYANT } from "./sms50-kampanya";
import {
  sms50BenzersizTiklamaSay,
  sms50HaftaAralikEtiket,
  sms50HaftaSecenekleri,
  sms50IstanbulPazartesiYmd,
  sms50Oran,
  sms50SatirlariHaftaFiltrele,
  sms50TiklamaGunSaat,
  sms50TiklamaSatirlarindanIzgara,
  SMS50_HAFTA_TUMU,
} from "./sms50-tiklama-db";

describe("sms50Oran", () => {
  it("payda 0 ise null", () => {
    expect(sms50Oran(5, 0)).toBeNull();
  });

  it("oran hesaplar", () => {
    expect(sms50Oran(1, 4)).toBe(0.25);
  });
});

describe("sms50BenzersizTiklamaSay", () => {
  it("aynı ip_hash tekrarını tek sayar", () => {
    const say = sms50BenzersizTiklamaSay([
      { id: "1", varyant: "c", ip_hash: "abc" },
      { id: "2", varyant: "c", ip_hash: "abc" },
      { id: "3", varyant: "c", ip_hash: "def" },
    ]);
    expect(say.get("c")).toBe(2);
  });

  it("ip yoksa satır id ile ayırır", () => {
    const say = sms50BenzersizTiklamaSay([
      { id: "1", varyant: "a", ip_hash: null },
      { id: "2", varyant: "a", ip_hash: null },
    ]);
    expect(say.get("a")).toBe(2);
  });
});

describe("sms50TiklamaGunSaat", () => {
  it("Istanbul saat diliminde gün/saat üretir (Pzt=0)", () => {
    /* 2026-07-22 15:30 UTC = 18:30 Europe/Istanbul (UTC+3), Çarşamba → gun 2 */
    const gs = sms50TiklamaGunSaat("2026-07-22T15:30:00.000Z");
    expect(gs).toEqual({ gun: 2, saat: 18 });
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
    expect(izgara.grid[2]![18]).toBe(1);
  });
});

describe("sms50 hafta filtresi", () => {
  it("Pazartesi YMD üretir (Istanbul)", () => {
    /* Çarşamba 22 Tem 2026 Istanbul → Pazartesi 20 Tem */
    expect(sms50IstanbulPazartesiYmd("2026-07-22T15:30:00.000Z")).toBe(
      "2026-07-20"
    );
  });

  it("hafta seçenekleri Tümü + sıralı haftalar", () => {
    const secenekler = sms50HaftaSecenekleri([
      { olusturulma: "2026-07-22T15:30:00.000Z", varyant: "a" },
      { olusturulma: "2026-07-08T10:00:00.000Z", varyant: "b" },
    ]);
    expect(secenekler[0]?.id).toBe(SMS50_HAFTA_TUMU);
    expect(secenekler.map((s) => s.id)).toEqual([
      SMS50_HAFTA_TUMU,
      "2026-07-20",
      "2026-07-06",
    ]);
    expect(secenekler[1]?.etiket).toContain("2. hafta");
    expect(secenekler[2]?.etiket).toContain("1. hafta");
    expect(sms50HaftaAralikEtiket("2026-07-20")).toMatch(/20/);
  });

  it("haftaya göre filtreler", () => {
    const rows = [
      { olusturulma: "2026-07-22T15:30:00.000Z", varyant: "a" },
      { olusturulma: "2026-07-08T10:00:00.000Z", varyant: "b" },
    ];
    const filt = sms50SatirlariHaftaFiltrele(rows, "2026-07-20");
    expect(filt).toHaveLength(1);
    expect(filt[0]?.varyant).toBe("a");
    expect(sms50SatirlariHaftaFiltrele(rows, SMS50_HAFTA_TUMU)).toHaveLength(2);
  });
});
