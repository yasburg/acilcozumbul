import { describe, expect, it } from "vitest";
import {
  demoBaslangicDurumu,
  isDemoTalepId,
  DEMO_TALEP_PREFIX,
} from "./demo-fixtures";
import {
  demoPanelVerisi,
  demoTeklifSecDurumu,
  mergeCekiciPanelData,
} from "./demo-oturum";
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
    expect(ana.teklifler?.length).toBeGreaterThanOrEqual(1);
    expect(ana.teklifler?.[0]?.cekiciId).toMatch(/^demo-rakip/);
    const gizli = durum.talepler.find((t) => t.id !== durum.anaTalepId)!;
    expect(gizli.bildirilenCekiciIds).toHaveLength(0);
  });
});

describe("demoPanelVerisi / mergeCekiciPanelData", () => {
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
    expect(mergeCekiciPanelData).toBe(demoPanelVerisi);
    expect(panel.bekleyen.length).toBeGreaterThanOrEqual(1);
    expect(panel.bekleyenGizli.length).toBeGreaterThanOrEqual(1);
    expect(panel.bekleyen.every((t) => !t.gizli)).toBe(true);
    expect(panel.bekleyenGizli.every((t) => t.gizli)).toBe(true);
  });

  it("kazanan tekliften sonra kazandiklarim listesine düşer", () => {
    const cekici = cekiciFixture({
      id: "c1",
      hizmetSorunTipleri: ["ariza", "lastik"],
    });
    const durum = demoBaslangicDurumu(cekici);
    const ana = durum.talepler.find((t) => t.id === durum.anaTalepId)!;
    const bizimTeklif: Teklif = {
      id: "tek-biz",
      cekiciId: cekici.id,
      cekiciAd: cekici.ad,
      fiyat: 2400,
      ilkFiyat: 2400,
      fiyatDegisti: false,
      tahminiSureDk: 20,
      tarih: new Date().toISOString(),
      durum: "aktif",
    };
    const talep = {
      ...ana,
      teklifler: [...(ana.teklifler ?? []), bizimTeklif],
    };
    const secildi = demoTeklifSecDurumu(talep, "tek-biz");
    const oturum = {
      id: "o1",
      cekiciId: cekici.id,
      bitis: new Date(Date.now() + 300_000).toISOString(),
      kalanSn: 300,
      durum: {
        ...durum,
        talepler: durum.talepler.map((t) =>
          t.id === ana.id ? secildi : t
        ),
      },
      olusturan: null,
    };
    const panel = demoPanelVerisi(oturum, cekici);
    expect(panel.kazandiklarim.some((t) => t.id === ana.id)).toBe(true);
    expect(panel.bekleyen.some((t) => t.id === ana.id)).toBe(false);
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
