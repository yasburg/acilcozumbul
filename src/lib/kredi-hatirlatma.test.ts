import { describe, expect, it } from "vitest";
import {
  KREDI_HATIRLATMA_COOLDOWN_MS,
  KREDI_HATIRLATMA_MAX_GONDERIM,
  cekiciKrediHatirlatmaAdayiMi,
  cekiciKrediHatirlatmaManuelAdayiMi,
  krediHatirlatmaCooldownAktifMi,
  krediHatirlatmaDurdurulduMu,
  krediHatirlatmaKisaPath,
  krediHatirlatmaSmsMetni,
  krediHatirlatmaTokenGecerliMi,
  krediHatirlatmaTokenUret,
  type KrediHatirlatmaCekiciOzet,
} from "./kredi-hatirlatma";
import { cekiciFixture, talepFixture } from "@/test/fixtures";

function ozet(
  overrides: Partial<KrediHatirlatmaCekiciOzet> = {}
): KrediHatirlatmaCekiciOzet {
  return {
    cekiciId: "cekici-1",
    basariliGonderim: 0,
    yuklenmemisBasarili: 0,
    sonBasariliAt: null,
    tiklayan: false,
    yukledi: false,
    ...overrides,
  };
}

describe("kredi hatırlatma", () => {
  it("token 8 char base62", () => {
    for (let i = 0; i < 20; i++) {
      const t = krediHatirlatmaTokenUret();
      expect(krediHatirlatmaTokenGecerliMi(t)).toBe(true);
      expect(t).toHaveLength(8);
    }
    expect(krediHatirlatmaTokenGecerliMi("short")).toBe(false);
    expect(krediHatirlatmaTokenGecerliMi("!!!!!!!!")).toBe(false);
  });

  it("kısa path ve ASCII SMS", () => {
    expect(krediHatirlatmaKisaPath("Ab12Cd34")).toBe("/kr/Ab12Cd34");
    const m = krediHatirlatmaSmsMetni("https://x.com/kr/Ab12Cd34");
    expect(m).toContain("https://x.com/kr/Ab12Cd34");
    expect(m).toMatch(/^[\x00-\x7F]+$/);
  });

  it("3 yüksüz gönderimde durdurur; yüklenen satırlar sayılmaz", () => {
    expect(
      krediHatirlatmaDurdurulduMu(
        ozet({ yuklenmemisBasarili: KREDI_HATIRLATMA_MAX_GONDERIM })
      )
    ).toBe(true);
    expect(
      krediHatirlatmaDurdurulduMu(ozet({ yuklenmemisBasarili: 0, yukledi: true }))
    ).toBe(false);
    expect(
      krediHatirlatmaDurdurulduMu(ozet({ yuklenmemisBasarili: 2 }))
    ).toBe(false);
    // Daha önce yüklemiş olsa bile yeni 3 yüksüz gönderim keser
    expect(
      krediHatirlatmaDurdurulduMu(
        ozet({
          yuklenmemisBasarili: KREDI_HATIRLATMA_MAX_GONDERIM,
          yukledi: true,
        })
      )
    ).toBe(true);
  });

  it("24s cooldown", () => {
    const now = Date.now();
    expect(
      krediHatirlatmaCooldownAktifMi(
        new Date(now - KREDI_HATIRLATMA_COOLDOWN_MS + 60_000).toISOString(),
        now
      )
    ).toBe(true);
    expect(
      krediHatirlatmaCooldownAktifMi(
        new Date(now - KREDI_HATIRLATMA_COOLDOWN_MS - 1).toISOString(),
        now
      )
    ).toBe(false);
    expect(krediHatirlatmaCooldownAktifMi(null, now)).toBe(false);
  });

  it("aday: koşullu + kredi yetersiz", () => {
    const talep = talepFixture({
      konumIl: "İstanbul",
      konumIlce: "Kadıköy",
    });
    const uygunYetersiz = cekiciFixture({ kredi: 0 });
    expect(cekiciKrediHatirlatmaAdayiMi(talep, uygunYetersiz, null)).toBe(
      true
    );

    const yeterli = cekiciFixture({ kredi: 5 });
    expect(cekiciKrediHatirlatmaAdayiMi(talep, yeterli, null)).toBe(false);

    const yanlisIlce = cekiciFixture({
      kredi: 0,
      hizmetBolgeleri: { İstanbul: ["Beşiktaş"] },
      hizmetIlceleri: ["Beşiktaş"],
    });
    expect(cekiciKrediHatirlatmaAdayiMi(talep, yanlisIlce, null)).toBe(false);
  });

  it("otomatik: 3-kural ve cooldown filtreler", () => {
    const talep = talepFixture({
      konumIl: "İstanbul",
      konumIlce: "Kadıköy",
    });
    const c = cekiciFixture({ kredi: 0 });
    const now = Date.now();

    expect(
      cekiciKrediHatirlatmaAdayiMi(
        talep,
        c,
        ozet({ yuklenmemisBasarili: 3 }),
        { cooldownUygula: true, nowMs: now }
      )
    ).toBe(false);

    expect(
      cekiciKrediHatirlatmaAdayiMi(
        talep,
        c,
        ozet({
          sonBasariliAt: new Date(now - 60_000).toISOString(),
        }),
        { cooldownUygula: true, nowMs: now }
      )
    ).toBe(false);

    expect(
      cekiciKrediHatirlatmaAdayiMi(
        talep,
        c,
        ozet({
          sonBasariliAt: new Date(now - 60_000).toISOString(),
        }),
        { cooldownUygula: false, nowMs: now }
      )
    ).toBe(true);
  });

  it("manuel: cooldown yok, 3-kural var", () => {
    const c = cekiciFixture({ kredi: 0 });
    expect(
      cekiciKrediHatirlatmaManuelAdayiMi(
        c,
        ozet({
          sonBasariliAt: new Date().toISOString(),
          yuklenmemisBasarili: 1,
        })
      )
    ).toBe(true);
    expect(
      cekiciKrediHatirlatmaManuelAdayiMi(
        c,
        ozet({ yuklenmemisBasarili: 3 })
      )
    ).toBe(false);
    expect(
      cekiciKrediHatirlatmaManuelAdayiMi(cekiciFixture({ kredi: 5 }), null)
    ).toBe(false);
  });
});
