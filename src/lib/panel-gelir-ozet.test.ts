import { describe, expect, it } from "vitest";
import {
  istanbulAyAnahtari,
  istanbulAyBaslangicIso,
  panelGelirOzetHesapla,
} from "./panel-gelir-ozet";

describe("panelGelirOzetHesapla", () => {
  const simdi = new Date("2026-08-15T12:00:00+03:00");

  it("ay anahtarı Istanbul takvimine göre", () => {
    expect(istanbulAyAnahtari(simdi)).toBe("2026-08");
    expect(istanbulAyBaslangicIso(simdi)).toBe("2026-08-01T00:00:00+03:00");
  });

  it("abonelik created+renewal ve tek seferlik krediyi ayırır", () => {
    const ozet = panelGelirOzetHesapla(
      [
        {
          tip: "created",
          tutarTl: 999,
          kredi: 1100,
          garantiOrderId: "abonelik1",
          createdAt: "2026-08-03T10:00:00.000Z",
        },
        {
          tip: "renewal",
          tutarTl: 499,
          kredi: 500,
          garantiOrderId: "renew1",
          createdAt: "2026-08-10T10:00:00.000Z",
        },
        {
          tip: "cancelled",
          tutarTl: 0,
          kredi: 0,
          createdAt: "2026-08-11T10:00:00.000Z",
        },
        {
          tip: "created",
          tutarTl: 1999,
          kredi: 2400,
          garantiOrderId: "eski",
          createdAt: "2026-07-20T10:00:00.000Z",
        },
      ],
      [
        {
          id: "abonelik-1",
          miktar: 1100,
          tutar: 999,
          paketTl: 999,
          demoOdeme: false,
          olusturulma: "2026-08-03T10:00:00.000Z",
        },
        {
          id: "kredi-1",
          miktar: 750,
          tutar: 999,
          paketTl: 999,
          demoOdeme: false,
          olusturulma: "2026-08-05T10:00:00.000Z",
        },
        {
          id: "demo-1",
          miktar: 250,
          tutar: 499,
          paketTl: 499,
          demoOdeme: true,
          olusturulma: "2026-08-06T10:00:00.000Z",
        },
      ],
      simdi
    );

    expect(ozet.ay).toBe("2026-08");
    expect(ozet.aylikPaketler.adet).toBe(2);
    expect(ozet.aylikPaketler.tutarTl).toBe(1498);
    expect(ozet.aylikPaketler.kredi).toBe(1600);
    expect(ozet.aylikPaketler.paketDagilim).toEqual([
      { paketTl: 999, adet: 1 },
      { paketTl: 499, adet: 1 },
    ]);

    expect(ozet.satinAlinanKrediler.adet).toBe(1);
    expect(ozet.satinAlinanKrediler.kredi).toBe(750);
    expect(ozet.satinAlinanKrediler.tutarTl).toBe(999);
  });
});
