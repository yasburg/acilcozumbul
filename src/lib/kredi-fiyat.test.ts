import { describe, expect, it } from "vitest";
import {
  krediPaketBul,
  krediPaketOdenecekTL,
  krediTutarKurus,
  tlTutarKurus,
} from "./kredi-fiyat";

describe("kredi-fiyat", () => {
  it("paket ödemeleri", () => {
    const p1000 = krediPaketBul(1000)!;
    expect(p1000.kredi).toBe(1000);
    expect(krediPaketOdenecekTL(p1000)).toBe(900);
    expect(tlTutarKurus(900)).toBe(90000);
  });

  it("indirimsiz paketler", () => {
    expect(krediPaketOdenecekTL(krediPaketBul(100)!)).toBe(100);
    expect(krediPaketOdenecekTL(krediPaketBul(250)!)).toBe(250);
    expect(tlTutarKurus(250)).toBe(25000);
  });

  it("birim fiyat (SMS)", () => {
    expect(krediTutarKurus(1)).toBe(100);
  });
});
