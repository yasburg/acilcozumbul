import { describe, expect, it } from "vitest";
import {
  KURULUM_HATIRLATMA_COOLDOWN_MS,
  KURULUM_HATIRLATMA_MAX_GONDERIM,
  KURULUM_HATIRLATMA_MIN_YAS_MS,
  cekiciKurulumHatirlatmaAdayiMi,
  kurulumHatirlatmaCooldownAktifMi,
  kurulumHatirlatmaDurdurulduMu,
  kurulumHatirlatmaKayitYasYeterliMi,
  kurulumHatirlatmaKisaPath,
  kurulumHatirlatmaMesajIndex,
  kurulumHatirlatmaSmsMetni,
  kurulumHatirlatmaTokenGecerliMi,
  kurulumHatirlatmaTokenUret,
  type KurulumHatirlatmaCekiciOzet,
} from "./kurulum-hatirlatma";
import { cekiciFixture } from "@/test/fixtures";

function ozet(
  overrides: Partial<KurulumHatirlatmaCekiciOzet> = {}
): KurulumHatirlatmaCekiciOzet {
  return {
    cekiciId: "cekici-1",
    basariliGonderim: 0,
    tamamlanmamisBasarili: 0,
    sonBasariliAt: null,
    tiklayan: false,
    kurulumTamamlandi: false,
    ...overrides,
  };
}

function eksikKurulum(overrides: Parameters<typeof cekiciFixture>[0] = {}) {
  const now = Date.now();
  return cekiciFixture({
    kurulumTamam: false,
    kayitFunnel: "b",
    ad: "A",
    hizmetBolgeleri: {},
    hizmetIlceleri: [],
    hizmetSorunTipleri: [],
    kayitTarihi: new Date(now - KURULUM_HATIRLATMA_MIN_YAS_MS - 60_000).toISOString(),
    ...overrides,
  });
}

describe("kurulum hatırlatma", () => {
  it("token 8 char base62", () => {
    for (let i = 0; i < 20; i++) {
      const t = kurulumHatirlatmaTokenUret();
      expect(kurulumHatirlatmaTokenGecerliMi(t)).toBe(true);
      expect(t).toHaveLength(8);
    }
    expect(kurulumHatirlatmaTokenGecerliMi("short")).toBe(false);
  });

  it("kısa path ve ASCII SMS dizisi", () => {
    expect(kurulumHatirlatmaKisaPath("Ab12Cd34")).toBe("/ku/Ab12Cd34");
    for (let i = 0; i < 4; i++) {
      const m = kurulumHatirlatmaSmsMetni("https://x.com/ku/Ab12Cd34", i);
      expect(m).toContain("https://x.com/ku/Ab12Cd34");
      expect(m).toMatch(/^[\x00-\x7F]+$/);
    }
    expect(kurulumHatirlatmaMesajIndex(0)).toBe(0);
    expect(kurulumHatirlatmaMesajIndex(3)).toBe(3);
    expect(kurulumHatirlatmaMesajIndex(99)).toBe(3);
  });

  it("4 tamamlanmamış gönderimde durdurur", () => {
    expect(
      kurulumHatirlatmaDurdurulduMu(
        ozet({ tamamlanmamisBasarili: KURULUM_HATIRLATMA_MAX_GONDERIM })
      )
    ).toBe(true);
    expect(
      kurulumHatirlatmaDurdurulduMu(ozet({ tamamlanmamisBasarili: 3 }))
    ).toBe(false);
  });

  it("7 gün cooldown", () => {
    const now = Date.now();
    expect(
      kurulumHatirlatmaCooldownAktifMi(
        new Date(now - KURULUM_HATIRLATMA_COOLDOWN_MS + 60_000).toISOString(),
        now
      )
    ).toBe(true);
    expect(
      kurulumHatirlatmaCooldownAktifMi(
        new Date(now - KURULUM_HATIRLATMA_COOLDOWN_MS - 1).toISOString(),
        now
      )
    ).toBe(false);
  });

  it("kayıt yaşı 24 saat", () => {
    const now = Date.now();
    expect(
      kurulumHatirlatmaKayitYasYeterliMi(
        new Date(now - KURULUM_HATIRLATMA_MIN_YAS_MS + 1000).toISOString(),
        now
      )
    ).toBe(false);
    expect(
      kurulumHatirlatmaKayitYasYeterliMi(
        new Date(now - KURULUM_HATIRLATMA_MIN_YAS_MS - 1).toISOString(),
        now
      )
    ).toBe(true);
  });

  it("aday: kurulum eksik + yaş", () => {
    expect(cekiciKurulumHatirlatmaAdayiMi(eksikKurulum(), null)).toBe(true);
    expect(
      cekiciKurulumHatirlatmaAdayiMi(
        eksikKurulum({ kurulumTamam: true }),
        null
      )
    ).toBe(false);
    expect(
      cekiciKurulumHatirlatmaAdayiMi(
        eksikKurulum({
          kayitTarihi: new Date().toISOString(),
        }),
        null
      )
    ).toBe(false);
  });

  it("cooldown ve 4-kural filtreler", () => {
    const c = eksikKurulum();
    const now = Date.now();
    expect(
      cekiciKurulumHatirlatmaAdayiMi(
        c,
        ozet({ tamamlanmamisBasarili: 4 }),
        { nowMs: now }
      )
    ).toBe(false);
    expect(
      cekiciKurulumHatirlatmaAdayiMi(
        c,
        ozet({
          sonBasariliAt: new Date(now - 60_000).toISOString(),
        }),
        { cooldownUygula: true, nowMs: now }
      )
    ).toBe(false);
    expect(
      cekiciKurulumHatirlatmaAdayiMi(
        c,
        ozet({
          sonBasariliAt: new Date(now - 60_000).toISOString(),
        }),
        { cooldownUygula: false, nowMs: now }
      )
    ).toBe(true);
  });

  it("tester ve profil hazır olanlar aday değil", () => {
    expect(
      cekiciKurulumHatirlatmaAdayiMi(
        eksikKurulum({ testerHesap: true }),
        null
      )
    ).toBe(false);
    expect(
      cekiciKurulumHatirlatmaAdayiMi(
        eksikKurulum({
          ad: "Ahmet Yılmaz",
          hizmetBolgeleri: { İstanbul: ["Kadıköy"] },
          hizmetSorunTipleri: ["cekici"],
        }),
        null
      )
    ).toBe(false);
  });
});
