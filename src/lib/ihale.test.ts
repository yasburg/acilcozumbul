import { describe, expect, it } from "vitest";
import {
  anlasamadiSonrasiIhaleyiSurdur,
  cekiciBildirimKrediTutari,
  cekiciTalebeBildirildiMi,
  ihaleBitisHesapla,
  ihaleDatetimeLocal,
  ihaleSureTipiNormalize,
  IHALE_OZEL_MAX_GUN,
  IHALE_SURE_DK,
  PANEL_BILDIRIM_KREDI,
  PREMIUM_SMS_BILDIRIM_KREDI,
  SMS_BILDIRIM_KREDI,
} from "./ihale";
import { talepFixture } from "@/test/fixtures";
import type { Teklif } from "./types";

function teklif(
  overrides: Partial<Teklif> & Pick<Teklif, "id" | "cekiciId" | "durum">
): Teklif {
  return {
    cekiciAd: "Test",
    fiyat: 1000,
    tahminiSureDk: 30,
    tarih: new Date().toISOString(),
    ...overrides,
  };
}

describe("ihale kredi sabitleri", () => {
  it("panel 1, premium SMS 2 kredi", () => {
    expect(PANEL_BILDIRIM_KREDI).toBe(1);
    expect(SMS_BILDIRIM_KREDI).toBe(1);
    expect(PREMIUM_SMS_BILDIRIM_KREDI).toBe(2);
    expect(cekiciBildirimKrediTutari({})).toBe(2);
    expect(cekiciBildirimKrediTutari({ premiumSmsAktif: true })).toBe(2);
    expect(cekiciBildirimKrediTutari({ premiumSmsAktif: false })).toBe(1);
  });

  it("bildirilen çekici talebi görebilir", () => {
    const t = talepFixture({ bildirilenCekiciIds: ["c1"] });
    expect(cekiciTalebeBildirildiMi(t, "c1")).toBe(true);
    expect(cekiciTalebeBildirildiMi(t, "c2")).toBe(false);
  });
});

describe("anlasamadiSonrasiIhaleyiSurdur", () => {
  it("kalan teklifleri aktif eder ve aynı ihaleye devam eder", () => {
    const talep = talepFixture({
      durum: "kazanan_belli",
      kazananCekiciId: "c1",
      kazananTeklifId: "t1",
      anlasmaDurumu: "bekliyor",
      teklifler: [
        teklif({ id: "t1", cekiciId: "c1", durum: "kazandi", fiyat: 900 }),
        teklif({ id: "t2", cekiciId: "c2", durum: "kaybetti", fiyat: 1100 }),
        teklif({ id: "t3", cekiciId: "c3", durum: "kaybetti", fiyat: 1200 }),
      ],
    });

    const { kalanAktif } = anlasamadiSonrasiIhaleyiSurdur(talep, "c1");

    expect(kalanAktif).toBe(2);
    expect(talep.durum).toBe("ihalede");
    expect(talep.kazananCekiciId).toBeUndefined();
    expect(talep.haricTutulanCekiciIds).toContain("c1");
    expect(talep.teklifler.find((t) => t.id === "t1")?.durum).toBe("kaybetti");
    expect(talep.teklifler.find((t) => t.id === "t2")?.durum).toBe("aktif");
    expect(talep.teklifler.find((t) => t.id === "t3")?.durum).toBe("aktif");
  });

  it("başka teklif yoksa yeniden ihale açar", () => {
    const talep = talepFixture({
      durum: "kazanan_belli",
      kazananCekiciId: "c1",
      kazananTeklifId: "t1",
      teklifler: [
        teklif({ id: "t1", cekiciId: "c1", durum: "kazandi", fiyat: 900 }),
      ],
    });

    const { kalanAktif } = anlasamadiSonrasiIhaleyiSurdur(talep, "c1");

    expect(kalanAktif).toBe(0);
    expect(talep.durum).toBe("yeniden_ihalede");
    expect(talep.haricTutulanCekiciIds).toContain("c1");
  });
});

describe("ihaleBitisHesapla", () => {
  const simdi = new Date("2026-08-05T12:00:00+03:00");

  it("acil = 1 saat", () => {
    const r = ihaleBitisHesapla("acil", { simdi });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.bitis.getTime() - simdi.getTime()).toBe(IHALE_SURE_DK * 60 * 1000);
  });

  it("1_gun = 24 saat", () => {
    const r = ihaleBitisHesapla("1_gun", { simdi });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.bitis.getTime() - simdi.getTime()).toBe(24 * 60 * 60 * 1000);
  });

  it("1_hafta = 7 gün", () => {
    const r = ihaleBitisHesapla("1_hafta", { simdi });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.bitis.getTime() - simdi.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("ozel geçerli tarih kabul eder", () => {
    const hedef = new Date(simdi.getTime() + 2 * 60 * 60 * 1000);
    const r = ihaleBitisHesapla("ozel", {
      simdi,
      ozelBitis: ihaleDatetimeLocal(hedef),
    });
    expect(r.ok).toBe(true);
  });

  it("ozel geçmiş / çok yakın reddeder", () => {
    const r = ihaleBitisHesapla("ozel", {
      simdi,
      ozelBitis: ihaleDatetimeLocal(simdi),
    });
    expect(r.ok).toBe(false);
  });

  it("ozel 1 aydan uzun reddeder", () => {
    const fazla = new Date(
      simdi.getTime() + (IHALE_OZEL_MAX_GUN + 1) * 24 * 60 * 60 * 1000
    );
    const r = ihaleBitisHesapla("ozel", {
      simdi,
      ozelBitis: ihaleDatetimeLocal(fazla),
    });
    expect(r.ok).toBe(false);
  });

  it("bilinmeyen tip acil’e düşer", () => {
    expect(ihaleSureTipiNormalize("xyz")).toBe("acil");
    expect(ihaleSureTipiNormalize("1_hafta")).toBe("1_hafta");
  });
});
