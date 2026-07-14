import { describe, expect, it } from "vitest";
import {
  demoBaslangicDurumu,
  isDemoTalepId,
  DEMO_TALEP_PREFIX,
} from "./demo-fixtures";
import { demoPanelVerisi, demoTeklifSecDurumu } from "./demo-oturum";
import { cekiciFixture } from "@/test/fixtures";
import type { Talep, Teklif } from "./types";

describe("demo-fixtures", () => {
  it("demo talep id tanır", () => {
    expect(isDemoTalepId(`${DEMO_TALEP_PREFIX}abc`)).toBe(true);
    expect(isDemoTalepId("gercek-id")).toBe(false);
  });

  it("başlangıç durumu çekici bölgesine uygun talepler üretir", () => {
    const cekici = cekiciFixture({ sehir: "İstanbul", id: "c-demo" });
    const durum = demoBaslangicDurumu(cekici);
    expect(durum.talepler).toHaveLength(2);
    expect(durum.anaTalepId).toMatch(/^demo-/);
    const ana = durum.talepler.find((t) => t.id === durum.anaTalepId)!;
    expect(ana.bildirilenCekiciIds).toContain("c-demo");
    expect(ana.konumIl).toBe("İstanbul");
    const gizli = durum.talepler.find((t) => t.id !== durum.anaTalepId)!;
    expect(gizli.bildirilenCekiciIds).toHaveLength(0);
  });
});

describe("demoPanelVerisi", () => {
  it("açık ve gizli listeleri ayırır", () => {
    const cekici = cekiciFixture({
      id: "c1",
      hizmetSorunTipleri: ["ariza"],
      hizmetModu: "konum",
      menzilKm: 5,
    });
    const durum = demoBaslangicDurumu(cekici);
    const oturum = {
      id: "o1",
      cekiciId: cekici.id,
      bitis: new Date(Date.now() + 300_000).toISOString(),
      kalanSn: 300,
      durum,
      olusturan: null,
    };
    const panel = demoPanelVerisi(oturum, cekici);
    expect(panel.bekleyen.length).toBeGreaterThanOrEqual(1);
    expect(panel.bekleyenGizli.length).toBeGreaterThanOrEqual(1);
    expect(panel.bekleyen.every((t) => !t.gizli)).toBe(true);
    expect(panel.bekleyenGizli.every((t) => t.gizli)).toBe(true);
  });
});

describe("demoTeklifSecDurumu", () => {
  function talepTekliflerle(): Talep {
    const cekici = cekiciFixture({ id: "c1", sehir: "İstanbul" });
    const durum = demoBaslangicDurumu(cekici);
    const ana = durum.talepler.find((t) => t.id === durum.anaTalepId)!;
    const teklifler: Teklif[] = [
      {
        id: "tek-1",
        cekiciId: "c1",
        cekiciAd: "Ali Demo",
        fiyat: 2000,
        ilkFiyat: 2000,
        fiyatDegisti: false,
        tahminiSureDk: 25,
        tarih: new Date().toISOString(),
        durum: "aktif",
      },
      {
        id: "tek-2",
        cekiciId: "rakip",
        cekiciAd: "Rakip",
        fiyat: 2200,
        ilkFiyat: 2200,
        fiyatDegisti: false,
        tahminiSureDk: 30,
        tarih: new Date().toISOString(),
        durum: "aktif",
      },
    ];
    return { ...ana, teklifler };
  }

  it("seçilen teklifi kazanan yapar", () => {
    const talep = talepTekliflerle();
    const sonuc = demoTeklifSecDurumu(talep, "tek-1");
    expect(sonuc.kazananCekiciId).toBe("c1");
    expect(sonuc.kazananTeklifId).toBe("tek-1");
    expect(sonuc.durum).toBe("kazanan_belli");
    expect(sonuc.anlasmaDurumu).toBe("bekliyor");
    expect(sonuc.teklifler?.find((t) => t.id === "tek-1")?.durum).toBe(
      "kazandi"
    );
    expect(sonuc.teklifler?.find((t) => t.id === "tek-2")?.durum).toBe(
      "kaybetti"
    );
  });

  it("çift seçimi reddeder", () => {
    const talep = demoTeklifSecDurumu(talepTekliflerle(), "tek-1");
    expect(() => demoTeklifSecDurumu(talep, "tek-2")).toThrow(/Zaten/);
  });
});
