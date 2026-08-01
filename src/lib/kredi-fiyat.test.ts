import { describe, expect, it } from "vitest";
import {
  ABONELIK_PAKETLERI,
  KREDI_SATIN_AL_PAKETLERI,
  krediPaketBul,
  krediPaketOdenecekTL,
  krediTutarKurus,
  tlTutarKurus,
} from "./kredi-fiyat";

describe("kredi-fiyat", () => {
  it("kredi satın al paketleri", () => {
    expect(krediPaketBul(499, "kredi")?.kredi).toBe(250);
    expect(krediPaketBul(999, "kredi")?.kredi).toBe(750);
    expect(krediPaketBul(1999, "kredi")?.kredi).toBe(1000);
    for (const p of KREDI_SATIN_AL_PAKETLERI) {
      expect(p.bonusKredi).toBe(0);
      expect(krediPaketOdenecekTL(p)).toBe(p.tutarTL);
    }
  });

  it("abonelik paketleri bonuslu", () => {
    expect(krediPaketBul(499, "abonelik")?.kredi).toBe(500);
    expect(krediPaketBul(999, "abonelik")).toMatchObject({
      kredi: 1100,
      bonusKredi: 100,
    });
    expect(krediPaketBul(1999, "abonelik")).toMatchObject({
      kredi: 2400,
      bonusKredi: 400,
    });
    for (const p of ABONELIK_PAKETLERI) {
      expect(krediPaketOdenecekTL(p)).toBe(p.tutarTL);
    }
  });

  it("kaynak karışmaz", () => {
    expect(krediPaketBul(999, "kredi")?.kredi).toBe(750);
    expect(krediPaketBul(999, "abonelik")?.kredi).toBe(1100);
  });

  it("birim fiyat (SMS)", () => {
    expect(krediTutarKurus(1)).toBe(100);
    expect(tlTutarKurus(499)).toBe(49900);
  });
});
