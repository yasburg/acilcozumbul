import { describe, expect, it } from "vitest";
import {
  anlasamadiSonrasiIhaleyiSurdur,
  cekiciBildirimKrediTutari,
  cekiciTalebeBildirildiMi,
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
