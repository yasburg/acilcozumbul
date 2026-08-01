import { describe, expect, it } from "vitest";
import {
  kayitFunnelAlanMi,
  kayitFunnelBenzersizSession,
  kayitFunnelGunlukHesapla,
  kayitFunnelOlayHacmiHesapla,
  kayitFunnelOlayMi,
  kayitFunnelOlaySunucuOnlyMi,
  kayitFunnelSessionHuniHesapla,
} from "./kayit-funnel-olay";

describe("kayit-funnel-olay allowlist", () => {
  it("sabit ve alan olaylarını doğrular", () => {
    expect(kayitFunnelOlayMi("goruldu")).toBe(true);
    expect(kayitFunnelOlayMi("cta_kayit_basla")).toBe(true);
    expect(kayitFunnelOlayMi("btn_otp_gonder")).toBe(true);
    expect(kayitFunnelOlayMi("field_focus_ad")).toBe(true);
    expect(kayitFunnelOlayMi("field_filled_telefon")).toBe(true);
    expect(kayitFunnelOlayMi("field_filled_xyz")).toBe(false);
    expect(kayitFunnelOlayMi("bilinmeyen")).toBe(false);
    expect(kayitFunnelAlanMi("otp")).toBe(true);
  });

  it("sunucu-only olayları ayırır", () => {
    expect(kayitFunnelOlaySunucuOnlyMi("hesap")).toBe(true);
    expect(kayitFunnelOlaySunucuOnlyMi("otp_ok")).toBe(true);
    expect(kayitFunnelOlaySunucuOnlyMi("panel_hazir")).toBe(true);
    expect(kayitFunnelOlaySunucuOnlyMi("otp_gonder")).toBe(false);
  });
});

describe("kayitFunnelSessionHuniHesapla", () => {
  it("unique session ile adım ve drop-off oranları üretir", () => {
    const rows = [
      { funnel: "a", olay: "goruldu", session_id: "s1" },
      { funnel: "a", olay: "field_filled_ad", session_id: "s1" },
      { funnel: "a", olay: "otp_gonder", session_id: "s1" },
      { funnel: "a", olay: "otp_ok", session_id: "s1" },
      { funnel: "a", olay: "hesap", session_id: "s1" },
      { funnel: "a", olay: "panel_hazir", session_id: "s1" },
      { funnel: "b", olay: "goruldu", session_id: "s2" },
      { funnel: "b", olay: "field_filled_telefon", session_id: "s2" },
      { funnel: "b", olay: "otp_gonder", session_id: "s2" },
      { funnel: "b", olay: "goruldu", session_id: null },
    ];
    const huni = kayitFunnelSessionHuniHesapla(rows);
    expect(huni[0]).toMatchObject({
      adim: "goruldu",
      sessionSayisi: 2,
      oncekiOran: null,
    });
    expect(huni[1]).toMatchObject({
      adim: "form_etkilesim",
      sessionSayisi: 2,
      oncekiOran: 1,
    });
    expect(huni[2]!.sessionSayisi).toBe(2);
    expect(huni[3]!.sessionSayisi).toBe(1);
    expect(huni[4]!.sessionSayisi).toBe(1);
    expect(huni[5]!.sessionSayisi).toBe(1);
    expect(kayitFunnelBenzersizSession(rows)).toBe(2);
  });

  it("telefon_focus form etkileşim sayılır", () => {
    const huni = kayitFunnelSessionHuniHesapla([
      { funnel: "b", olay: "goruldu", session_id: "s1" },
      { funnel: "b", olay: "telefon_focus", session_id: "s1" },
    ]);
    expect(huni[1]).toMatchObject({
      adim: "form_etkilesim",
      sessionSayisi: 1,
    });
  });
});

describe("kayitFunnelGunlukHesapla / olay hacmi", () => {
  it("günlük görülme ve hesap sayar", () => {
    const gunluk = kayitFunnelGunlukHesapla([
      {
        funnel: "a",
        olay: "goruldu",
        olusturulma: "2026-07-01T10:00:00.000Z",
      },
      {
        funnel: "a",
        olay: "goruldu",
        olusturulma: "2026-07-01T11:00:00.000Z",
      },
      {
        funnel: "b",
        olay: "hesap",
        olusturulma: "2026-07-01T12:00:00.000Z",
      },
      {
        funnel: "b",
        olay: "hesap",
        olusturulma: "2026-07-02T09:00:00.000Z",
      },
    ]);
    expect(gunluk).toEqual([
      { gun: "2026-07-01", goruldu: 2, hesap: 1 },
      { gun: "2026-07-02", goruldu: 0, hesap: 1 },
    ]);
  });

  it("tarih aralığındaki boş günleri doldurur", () => {
    const gunluk = kayitFunnelGunlukHesapla(
      [
        {
          funnel: "a",
          olay: "goruldu",
          olusturulma: "2026-07-01T10:00:00+03:00",
        },
      ],
      { from: "2026-07-01", to: "2026-07-03" }
    );
    expect(gunluk).toEqual([
      { gun: "2026-07-01", goruldu: 1, hesap: 0 },
      { gun: "2026-07-02", goruldu: 0, hesap: 0 },
      { gun: "2026-07-03", goruldu: 0, hesap: 0 },
    ]);
  });

  it("olay hacmini funnel kırılımıyla verir", () => {
    const hacim = kayitFunnelOlayHacmiHesapla([
      { funnel: "a", olay: "goruldu" },
      { funnel: "a", olay: "goruldu" },
      { funnel: "b", olay: "goruldu" },
      { funnel: "b", olay: "hesap" },
    ]);
    expect(hacim[0]).toMatchObject({
      olay: "goruldu",
      sayi: 3,
      byFunnel: { a: 2, b: 1 },
    });
  });
});
