import { describe, expect, it } from "vitest";
import { kayitFunnelOzetHesapla } from "./kayit-funnel-olay";
import { cekiciProfilHazirMi } from "./cekici-profil-hazir";
import type { Cekici } from "./types";

describe("kayitFunnelOzetHesapla", () => {
  it("oranları hesaplar", () => {
    const ozet = kayitFunnelOzetHesapla(
      [
        { funnel: "b", olay: "goruldu" },
        { funnel: "b", olay: "goruldu" },
        { funnel: "b", olay: "otp_gonder" },
        { funnel: "b", olay: "hesap" },
        { funnel: "b", olay: "panel_hazir" },
      ],
      [{ id: "b", etiket: "B", yol: "/kayit/b" }]
    );
    expect(ozet[0]?.goruldu).toBe(2);
    expect(ozet[0]?.hesapOran).toBe(0.5);
    expect(ozet[0]?.hazirOran).toBe(1);
  });
});

describe("cekiciProfilHazirMi", () => {
  const base: Cekici = {
    id: "1",
    ad: "",
    telefon: "905551111111",
    token: "t",
    sifre: "",
    kredi: 0,
    sehir: "İstanbul",
    aktif: true,
    kayitTarihi: new Date().toISOString(),
    kurulumTamam: false,
    kayitFunnel: "b",
    hizmetBolgeleri: {},
    hizmetSorunTipleri: [],
  };

  it("eksik profilde false", () => {
    expect(cekiciProfilHazirMi(base)).toBe(false);
  });

  it("dolu profilde true", () => {
    expect(
      cekiciProfilHazirMi({
        ...base,
        ad: "Ali Veli",
        hizmetBolgeleri: { İstanbul: ["Kadıköy"] },
        hizmetSorunTipleri: ["cekici"],
        kurulumTamam: true,
      })
    ).toBe(true);
  });
});
