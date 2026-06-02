import { describe, expect, it } from "vitest";
import type { Cekici, ListeDurumu, Talep } from "./types";
import {
  cekiciAcikTalepUygunMu,
  cekiciHaricMi,
  cekiciTalebeBildirildiMi,
  cekiciTeklifVerdiMi,
  cekiciTeklifVerebilirMi,
  ihaleAcikMi,
} from "./ihale";
import { cekiciTalepBolgesineUygunMu } from "./cekici-bolge";
import { cekiciTalepSorununaUygunMu } from "./cekici-sorun";
import { cekiciFixture, talepFixture } from "@/test/fixtures";

/** panel GET /api/cekici/talepler ile aynı mantık */
function listeDurumuBelirle(talep: Talep, cekici: Cekici): ListeDurumu {
  const cekiciId = cekici.id;
  if (talep.kazananCekiciId === cekiciId) return "kazandim";
  if (talep.durum === "anlaşıldı" && talep.kazananCekiciId === cekiciId)
    return "anlasildi";
  if (cekiciHaricMi(talep, cekiciId)) return "tercih_edilmedi";
  if (talep.kazananCekiciId && talep.kazananCekiciId !== cekiciId) {
    return "kaybettim";
  }
  if (cekiciTeklifVerdiMi(talep, cekiciId)) return "teklif_verdim";
  if (cekiciAcikTalepUygunMu(talep, cekici)) {
    if (cekiciTalebeBildirildiMi(talep, cekiciId)) return "acik";
    return "gizli";
  }
  return "kaybettim";
}

function teklifVerilebilirMi(cekici: Cekici, talep: Talep): boolean {
  if (!cekiciTeklifVerebilirMi(talep, cekici.id)) return false;
  if (!cekiciTalepBolgesineUygunMu(cekici, talep)) return false;
  if (!cekiciTalepSorununaUygunMu(cekici, talep)) return false;
  return true;
}

describe("F — Panel / teklif mantığı", () => {
  const cekici = cekiciFixture({ id: "ben" });

  it("F1: bölge+sorun uygun ve SMS bildirimi var → acik", () => {
    const t = talepFixture({
      konumIl: "İstanbul",
      konumIlce: "Kadıköy",
      bildirilenCekiciIds: ["ben"],
    });
    expect(listeDurumuBelirle(t, cekici)).toBe("acik");
  });

  it("F1b: bildirim yok → gizli (panelde kilitli)", () => {
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" });
    expect(listeDurumuBelirle(t, cekici)).toBe("gizli");
  });

  it("F2: bölge dışı açık ihale → kaybettim (listede görünmez)", () => {
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Beşiktaş" });
    expect(listeDurumuBelirle(t, cekici)).toBe("kaybettim");
  });

  it("F3: teklif verilmiş açık ihale → teklif_verdim", () => {
    const t = talepFixture({
      konumIl: "İstanbul",
      konumIlce: "Kadıköy",
      teklifler: [
        {
          id: "te1",
          cekiciId: "ben",
          cekiciAd: "Test",
          fiyat: 1000,
          tahminiSureDk: 30,
          tarih: new Date().toISOString(),
          durum: "aktif",
        },
      ],
    });
    expect(listeDurumuBelirle(t, cekici)).toBe("teklif_verdim");
  });

  it("F4: teklif — bölge dışı → verilemez", () => {
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Beşiktaş" });
    expect(teklifVerilebilirMi(cekici, t)).toBe(false);
  });

  it("F5: teklif — sorun uyumsuz → verilemez", () => {
    const c = cekiciFixture({ hizmetSorunTipleri: ["aku"] });
    const t = talepFixture({ sorunTipi: "lastik", konumIlce: "Kadıköy", konumIl: "İstanbul" });
    expect(teklifVerilebilirMi(c, t)).toBe(false);
  });

  it("F6: konum modu menzil dışı → teklif verilemez", () => {
    const c = cekiciFixture({
      id: "ben",
      hizmetModu: "konum",
      menzilKm: 5,
      konumLat: 41.0082,
      konumLng: 28.9784,
      konumGuncelleme: new Date().toISOString(),
    });
    const t = talepFixture({
      konum: { lat: 41.5, lng: 28.9784, adres: "uzak" },
    });
    expect(teklifVerilebilirMi(c, t)).toBe(false);
  });
});
