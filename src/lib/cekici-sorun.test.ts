import { describe, expect, it } from "vitest";
import {
  cekiciTalepSorununaUygunMu,
  filtreleCekicilerSorun,
  normalizeHizmetSorunTipleri,
} from "./cekici-sorun";
import { cekiciTalepBolgesineUygunMu } from "./cekici-bolge";
import { cekiciFixture, talepFixture } from "@/test/fixtures";

describe("C — Sorun tipi", () => {
  it("C1: lastik çekici + lastik talep → uygun", () => {
    const c = cekiciFixture({ hizmetSorunTipleri: ["lastik"] });
    const t = talepFixture({ sorunTipi: "lastik" });
    expect(cekiciTalepSorununaUygunMu(c, t)).toBe(true);
  });

  it("C2: sadece lastik, talep aku → uygun değil", () => {
    const c = cekiciFixture({ hizmetSorunTipleri: ["lastik"] });
    const t = talepFixture({ sorunTipi: "aku" });
    expect(cekiciTalepSorununaUygunMu(c, t)).toBe(false);
  });

  it("C3: boş sorun tipleri → uygun değil", () => {
    const c = cekiciFixture({ hizmetSorunTipleri: [] });
    const t = talepFixture({ sorunTipi: "lastik" });
    expect(cekiciTalepSorununaUygunMu(c, t)).toBe(false);
  });

  it("C4: geçersiz sorun tipi → diger", () => {
    const c = cekiciFixture({ hizmetSorunTipleri: ["diger"] });
    const t = talepFixture({ sorunTipi: "bilinmeyen_xyz" });
    expect(cekiciTalepSorununaUygunMu(c, t)).toBe(true);
  });

  it("C5: bölge uygun değil + sorun uygun → bölge false", () => {
    const c = cekiciFixture({
      hizmetSorunTipleri: ["lastik"],
      hizmetBolgeleri: { İstanbul: ["Kadıköy"] },
    });
    const t = talepFixture({ sorunTipi: "lastik", konumIlce: "Beşiktaş", konumIl: "İstanbul" });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(false);
  });

  it("C6: menzil uygun + sorun uyumsuz", () => {
    const c = cekiciFixture({
      hizmetModu: "konum",
      menzilKm: 50,
      konumLat: 41.0082,
      konumLng: 28.9784,
      konumGuncelleme: new Date().toISOString(),
      hizmetSorunTipleri: ["lastik"],
    });
    const t = talepFixture({
      sorunTipi: "aku",
      konum: { lat: 41.01, lng: 28.98, adres: "yakın" },
    });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(true);
    expect(cekiciTalepSorununaUygunMu(c, t)).toBe(false);
  });

  it("normalizeHizmetSorunTipleri geçersizleri atar", () => {
    expect(normalizeHizmetSorunTipleri(["lastik", "foo", "aku"])).toEqual(
      expect.arrayContaining(["aku", "lastik"])
    );
    expect(normalizeHizmetSorunTipleri(["lastik", "foo", "aku"])).toHaveLength(2);
  });
});

describe("filtreleCekicilerSorun", () => {
  it("sorun filtresi uygular", () => {
    const a = cekiciFixture({ id: "a", hizmetSorunTipleri: ["lastik"] });
    const b = cekiciFixture({ id: "b", hizmetSorunTipleri: ["aku"] });
    const t = talepFixture({ sorunTipi: "lastik" });
    expect(filtreleCekicilerSorun([a, b], t).map((c) => c.id)).toEqual(["a"]);
  });
});
