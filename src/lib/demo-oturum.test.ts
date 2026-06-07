import { describe, expect, it } from "vitest";
import {
  demoBaslangicDurumu,
  isDemoTalepId,
  DEMO_TALEP_PREFIX,
} from "./demo-fixtures";
import { demoPanelVerisi } from "./demo-oturum";
import { cekiciFixture } from "@/test/fixtures";

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
