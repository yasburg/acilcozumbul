import { describe, expect, it } from "vitest";
import {
  kayitFunnelAlanMi,
  kayitFunnelBenzersizSession,
  kayitFunnelGunlukHesapla,
  kayitFunnelHuniAdimlari,
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
    expect(kayitFunnelOlayMi("form_adim_1")).toBe(true);
    expect(kayitFunnelOlayMi("form_adim_2")).toBe(true);
    expect(kayitFunnelOlayMi("form_adim_3")).toBe(true);
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

describe("kayitFunnelHuniAdimlari tip bazlı", () => {
  it("ortak adımlarda form_adim yok", () => {
    const ids = kayitFunnelHuniAdimlari("ortak").map((a) => a.id);
    expect(ids).toEqual([
      "goruldu",
      "form_etkilesim",
      "otp_gonder",
      "otp_ok",
      "hesap",
      "panel_hazir",
    ]);
  });

  it("phone_first telefon_focus kullanır, form_adim kullanmaz", () => {
    const ids = kayitFunnelHuniAdimlari("phone_first").map((a) => a.id);
    expect(ids).toContain("telefon_focus");
    expect(ids).not.toContain("form_adim_1");
    expect(ids.at(-1)).toBe("panel_hazir");
  });

  it("secim_wizard form_adim_1..3 kullanır", () => {
    const ids = kayitFunnelHuniAdimlari("secim_wizard").map((a) => a.id);
    expect(ids).toEqual([
      "goruldu",
      "form_etkilesim",
      "form_adim_1",
      "form_adim_2",
      "form_adim_3",
      "otp_gonder",
      "otp_ok",
      "hesap",
      "panel_hazir",
    ]);
  });

  it("kontrol CTA + telefon alan olayları kullanır", () => {
    const ids = kayitFunnelHuniAdimlari("kontrol").map((a) => a.id);
    expect(ids).toContain("cta_kayit_basla");
    expect(ids).toContain("telefon");
    expect(ids).not.toContain("form_adim_1");
  });
});

describe("kayitFunnelSessionHuniHesapla", () => {
  it("phone_first hunisinde form_adim sıfır göstermez", () => {
    const rows = [
      { funnel: "b", olay: "goruldu", session_id: "s1" },
      { funnel: "b", olay: "telefon_focus", session_id: "s1" },
      { funnel: "b", olay: "otp_gonder", session_id: "s1" },
      { funnel: "b", olay: "otp_ok", session_id: "s1" },
      { funnel: "b", olay: "hesap", session_id: "s1" },
      { funnel: "b", olay: "panel_hazir", session_id: "s1" },
      { funnel: "b", olay: "goruldu", session_id: "s2" },
      { funnel: "b", olay: "telefon_focus", session_id: "s2" },
      { funnel: "b", olay: "otp_gonder", session_id: "s2" },
    ];
    const huni = kayitFunnelSessionHuniHesapla(rows, "phone_first");
    expect(huni.map((a) => a.adim)).toEqual([
      "goruldu",
      "form_etkilesim",
      "telefon_focus",
      "otp_gonder",
      "otp_ok",
      "hesap",
      "panel_hazir",
    ]);
    expect(huni[0]!.sessionSayisi).toBe(2);
    expect(huni[1]!.sessionSayisi).toBe(2); // telefon_focus = ilk etkileşim
    expect(huni[2]!.sessionSayisi).toBe(2); // telefon_focus
    expect(huni[3]!.sessionSayisi).toBe(2); // otp_gonder
    expect(huni[4]!.sessionSayisi).toBe(1); // otp_ok
    expect(huni[5]!.sessionSayisi).toBe(1);
    expect(huni[6]!.sessionSayisi).toBe(1);
  });

  it("unique session ile ortak huni üretir", () => {
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
    const huni = kayitFunnelSessionHuniHesapla(rows, "ortak");
    expect(huni.map((a) => a.adim)).toEqual([
      "goruldu",
      "form_etkilesim",
      "otp_gonder",
      "otp_ok",
      "hesap",
      "panel_hazir",
    ]);
    expect(huni[0]!.sessionSayisi).toBe(2);
    expect(huni[1]!.sessionSayisi).toBe(2);
    expect(huni[2]!.sessionSayisi).toBe(2);
    expect(huni[3]!.sessionSayisi).toBe(1);
    expect(kayitFunnelBenzersizSession(rows)).toBe(2);
  });

  it("telefon_focus ilk etkileşim sayılır", () => {
    const huni = kayitFunnelSessionHuniHesapla(
      [
        { funnel: "b", olay: "goruldu", session_id: "s1" },
        { funnel: "b", olay: "telefon_focus", session_id: "s1" },
      ],
      "phone_first"
    );
    expect(huni[1]).toMatchObject({
      adim: "form_etkilesim",
      label: "İlk etkileşim",
      sessionSayisi: 1,
    });
  });

  it("wizard form_adim olaylarıyla adım hunisini doldurur", () => {
    const huni = kayitFunnelSessionHuniHesapla(
      [
        { funnel: "c", olay: "goruldu", session_id: "s1" },
        { funnel: "c", olay: "form_adim_1", session_id: "s1" },
        { funnel: "c", olay: "form_adim_2", session_id: "s1" },
        { funnel: "c", olay: "form_adim_3", session_id: "s1" },
        { funnel: "c", olay: "otp_gonder", session_id: "s1" },
        { funnel: "c", olay: "goruldu", session_id: "s2" },
        { funnel: "c", olay: "cta_kayit_basla", session_id: "s2" },
        { funnel: "c", olay: "form_adim_1", session_id: "s2" },
      ],
      "secim_wizard"
    );
    expect(huni[1]).toMatchObject({
      adim: "form_etkilesim",
      sessionSayisi: 2,
    });
    expect(huni[2]).toMatchObject({ adim: "form_adim_1", sessionSayisi: 2 });
    expect(huni[3]).toMatchObject({ adim: "form_adim_2", sessionSayisi: 1 });
    expect(huni[4]).toMatchObject({ adim: "form_adim_3", sessionSayisi: 1 });
    expect(huni[5]).toMatchObject({ adim: "otp_gonder", sessionSayisi: 1 });
  });

  it("kontrol hunisinde CTA ve telefon adımları", () => {
    const huni = kayitFunnelSessionHuniHesapla(
      [
        { funnel: "a", olay: "goruldu", session_id: "s1" },
        { funnel: "a", olay: "cta_kayit_basla", session_id: "s1" },
        { funnel: "a", olay: "field_filled_telefon", session_id: "s1" },
        { funnel: "a", olay: "otp_gonder", session_id: "s1" },
      ],
      "kontrol"
    );
    expect(huni.map((a) => a.adim)).toContain("cta_kayit_basla");
    expect(huni.find((a) => a.adim === "cta_kayit_basla")!.sessionSayisi).toBe(
      1
    );
    expect(huni.find((a) => a.adim === "telefon")!.sessionSayisi).toBe(1);
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
