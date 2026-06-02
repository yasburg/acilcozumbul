import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cekiciTalepBolgesineUygunMu,
  filtreleCekicilerBolge,
  talepKonumBolge,
} from "./cekici-bolge";
import { cekiciKonumGuncelMi } from "./cekici-hizmet-bolge";
import {
  cekiciFixture,
  KONUM_10KM,
  KONUM_35KM,
  KONUM_MERKEZ,
  talepFixture,
} from "@/test/fixtures";

describe("A — İl/ilçe modu", () => {
  it("A1: Kadıköy seçili, talep Kadıköy → uygun", () => {
    const c = cekiciFixture({
      hizmetModu: "il_ilce",
      hizmetBolgeleri: { İstanbul: ["Kadıköy"] },
    });
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(true);
  });

  it("A2: Kadıköy seçili, talep Beşiktaş → uygun değil", () => {
    const c = cekiciFixture({
      hizmetBolgeleri: { İstanbul: ["Kadıköy"] },
    });
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Beşiktaş" });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(false);
  });

  it("A3: Ankara çekici, İzmir talep → uygun değil", () => {
    const c = cekiciFixture({
      hizmetBolgeleri: { Ankara: ["Çankaya"] },
      sehir: "Ankara",
    });
    const t = talepFixture({ konumIl: "İzmir", konumIlce: "Konak" });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(false);
  });

  it("A4: İstanbul + Ankara seçili, Ankara/Çankaya talep → uygun", () => {
    const c = cekiciFixture({
      hizmetBolgeleri: {
        İstanbul: ["Kadıköy"],
        Ankara: ["Çankaya"],
      },
    });
    const t = talepFixture({ konumIl: "Ankara", konumIlce: "Çankaya" });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(true);
  });

  it("A5: İstanbul+Ankara seçili, Bursa talep → uygun değil", () => {
    const c = cekiciFixture({
      hizmetBolgeleri: {
        İstanbul: ["Kadıköy"],
        Ankara: ["Çankaya"],
      },
    });
    const t = talepFixture({ konumIl: "Bursa", konumIlce: "Osmangazi" });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(false);
  });

  it("A6: Boş hizmet bölgeleri → uygun değil", () => {
    const c = cekiciFixture({ hizmetBolgeleri: {}, hizmetIlceleri: [] });
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(false);
  });

  it("A7: İl/ilçe yok, adres parse edilemiyor → uygun değil", () => {
    const c = cekiciFixture({ hizmetBolgeleri: { İstanbul: ["Kadıköy"] } });
    const t = talepFixture({
      konumIl: undefined,
      konumIlce: undefined,
      konum: { lat: 0, lng: 0, adres: "Bilinmeyen yer XYZ" },
    });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(false);
  });

  it("A8: Adres metninden Kadıköy parse → uygun", () => {
    const c = cekiciFixture({ hizmetBolgeleri: { İstanbul: ["Kadıköy"] } });
    const t = talepFixture({
      konum: { lat: 41, lng: 29, adres: "Moda, Kadıköy, İstanbul" },
    });
    const bolge = talepKonumBolge(t);
    expect(bolge.ilce).toBe("Kadıköy");
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(true);
  });

  it("A9: Merkez sadece Kırıkkale — Karaman Merkez talep eşleşmez", () => {
    const c = cekiciFixture({
      hizmetBolgeleri: { Kırıkkale: ["Merkez"] },
      sehir: "Kırıkkale",
    });
    const t = talepFixture({ konumIl: "Karaman", konumIlce: "Merkez" });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(false);
  });

  it("A12: konum modu — il/ilçe listesi yok sayılır (sadece menzil)", () => {
    const c = cekiciFixture({
      hizmetModu: "konum",
      menzilKm: 10,
      konumLat: KONUM_MERKEZ.lat,
      konumLng: KONUM_MERKEZ.lng,
      konumGuncelleme: new Date().toISOString(),
      hizmetBolgeleri: { İstanbul: ["Kadıköy"] },
    });
    const t = talepFixture({
      konumIl: "İstanbul",
      konumIlce: "Kadıköy",
      konum: { lat: KONUM_35KM.lat, lng: KONUM_35KM.lng, adres: "Kadıköy uzak" },
    });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(false);
  });
});

describe("B — Konum + menzil", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-02T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  function konumCekici(km: number, menzil = 30) {
    const now = Date.now();
    return cekiciFixture({
      hizmetModu: "konum",
      menzilKm: menzil,
      konumLat: KONUM_MERKEZ.lat,
      konumLng: KONUM_MERKEZ.lng,
      konumGuncelleme: new Date(now).toISOString(),
      hizmetBolgeleri: {},
    });
  }

  it("B1: 10 km, menzil 30 → uygun", () => {
    const c = konumCekici(30);
    const t = talepFixture({
      konum: { lat: KONUM_10KM.lat, lng: KONUM_10KM.lng, adres: "yakın" },
    });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(true);
  });

  it("B2: 35 km, menzil 30 → uygun değil", () => {
    const c = konumCekici(30);
    const t = talepFixture({
      konum: { lat: KONUM_35KM.lat, lng: KONUM_35KM.lng, adres: "uzak" },
    });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(false);
  });

  it("B3: sınırda menzil içi → uygun", () => {
    const c = konumCekici(30, 25);
    const t = talepFixture({
      konum: { lat: KONUM_10KM.lat, lng: KONUM_10KM.lng, adres: "sınır" },
    });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(true);
  });

  it("B4: menzil 0 → uygun değil", () => {
    const c = konumCekici(10, 0);
    const t = talepFixture({
      konum: { lat: KONUM_10KM.lat, lng: KONUM_10KM.lng, adres: "yakın" },
    });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(false);
  });

  it("B5: menzil 100, ~35 km → uygun", () => {
    const c = konumCekici(100, 100);
    const t = talepFixture({
      konum: { lat: KONUM_35KM.lat, lng: KONUM_35KM.lng, adres: "uzak" },
    });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(true);
  });

  it("B6: konumLat/Lng yok → uygun değil", () => {
    const c = cekiciFixture({
      hizmetModu: "konum",
      menzilKm: 30,
      konumLat: undefined,
      konumLng: undefined,
    });
    const t = talepFixture({
      konum: { lat: KONUM_10KM.lat, lng: KONUM_10KM.lng, adres: "yakın" },
    });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(false);
  });

  it("B7: konum 15 dk önce → uygun değil", () => {
    const c = cekiciFixture({
      hizmetModu: "konum",
      menzilKm: 30,
      konumLat: KONUM_MERKEZ.lat,
      konumLng: KONUM_MERKEZ.lng,
      konumGuncelleme: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    });
    expect(cekiciKonumGuncelMi(c, 10)).toBe(false);
    const t = talepFixture({
      konum: { lat: KONUM_10KM.lat, lng: KONUM_10KM.lng, adres: "yakın" },
    });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(false);
  });

  it("B8: konum 3 dk önce → uygun", () => {
    const c = cekiciFixture({
      hizmetModu: "konum",
      menzilKm: 30,
      konumLat: KONUM_MERKEZ.lat,
      konumLng: KONUM_MERKEZ.lng,
      konumGuncelleme: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    });
    expect(cekiciKonumGuncelMi(c, 10)).toBe(true);
    const t = talepFixture({
      konum: { lat: KONUM_10KM.lat, lng: KONUM_10KM.lng, adres: "yakın" },
    });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(true);
  });

  it("B9: konum modu — Kadıköy ilçe seçili olsa bile menzil dışı eşleşmez", () => {
    const c = cekiciFixture({
      hizmetModu: "konum",
      menzilKm: 5,
      konumLat: KONUM_MERKEZ.lat,
      konumLng: KONUM_MERKEZ.lng,
      konumGuncelleme: new Date().toISOString(),
      hizmetBolgeleri: { İstanbul: ["Kadıköy"] },
    });
    const t = talepFixture({
      konumIl: "İstanbul",
      konumIlce: "Kadıköy",
      konum: { lat: KONUM_35KM.lat, lng: KONUM_35KM.lng, adres: "Kadıköy" },
    });
    expect(cekiciTalepBolgesineUygunMu(c, t)).toBe(false);
  });
});

describe("filtreleCekicilerBolge", () => {
  it("birden fazla çekici filtreler", () => {
    const uygun = cekiciFixture({ id: "a", hizmetBolgeleri: { İstanbul: ["Kadıköy"] } });
    const degil = cekiciFixture({
      id: "b",
      hizmetBolgeleri: { İstanbul: ["Beşiktaş"] },
    });
    const t = talepFixture({ konumIl: "İstanbul", konumIlce: "Kadıköy" });
    const sonuc = filtreleCekicilerBolge([uygun, degil], t);
    expect(sonuc.map((c) => c.id)).toEqual(["a"]);
  });
});
