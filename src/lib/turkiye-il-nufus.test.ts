import { describe, expect, it } from "vitest";
import {
  sehirYolYardimTalepMetni,
  sehirYolYardimTalepTahmini,
  sehirdeYazi,
  enBuyukIller,
  illerSecimSirasi,
} from "./turkiye-il-nufus";

describe("turkiye-il-nufus", () => {
  it("İstanbul için günlük %0,044 nüfus tahmini üretir", () => {
    const n = sehirYolYardimTalepTahmini("İstanbul");
    const ham = 15_655_924 * 0.00044;
    expect(n).toBe(Math.ceil(ham / 10) * 10);
    expect(n! % 10).toBe(0);
  });

  it("locative ekleri", () => {
    expect(sehirdeYazi("İstanbul")).toBe("İstanbul’da");
    expect(sehirdeYazi("İzmir")).toBe("İzmir’de");
  });

  it("metin üretir", () => {
    const m = sehirYolYardimTalepMetni("İstanbul");
    expect(m).toMatch(/^İstanbul’da günde yaklaşık /);
    expect(m).toMatch(/yol yardım talebi oluyor\.$/);
  });

  it("en büyük 5 il nüfus sırası", () => {
    expect(enBuyukIller(5)).toEqual([
      "İstanbul",
      "Ankara",
      "İzmir",
      "Bursa",
      "Antalya",
    ]);
  });

  it("seçim listesinde büyük iller üstte, kalanlar alfabetik", () => {
    expect(
      illerSecimSirasi([
        "Zonguldak",
        "Adana",
        "İzmir",
        "Ankara",
        "Bursa",
        "Antalya",
        "İstanbul",
      ])
    ).toEqual([
      "İstanbul",
      "Ankara",
      "İzmir",
      "Bursa",
      "Antalya",
      "Adana",
      "Zonguldak",
    ]);
  });
});
