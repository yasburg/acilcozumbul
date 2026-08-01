import { describe, expect, it } from "vitest";
import {
  abonelikNextRetryAt,
  abonelikPaketKredisi,
  abonelikRenewsAtHesapla,
} from "./abonelik-db";

describe("abonelik helpers", () => {
  it("paket kredisi abonelik hattından", () => {
    expect(abonelikPaketKredisi(499)).toBe(500);
    expect(abonelikPaketKredisi(999)).toBe(1100);
    expect(abonelikPaketKredisi(1999)).toBe(2400);
    expect(abonelikPaketKredisi(100)).toBe(0);
  });

  it("renewsAt bir ay ileri", () => {
    const from = new Date("2026-01-15T10:00:00.000Z");
    const renews = new Date(abonelikRenewsAtHesapla(from));
    expect(renews.getUTCMonth()).toBe(1); // Şubat
    expect(renews.getUTCDate()).toBe(15);
  });

  it("retry backoff 1/3/7 gün", () => {
    const base = new Date("2026-08-01T00:00:00.000Z");
    const d1 = new Date(abonelikNextRetryAt(1, base));
    const d2 = new Date(abonelikNextRetryAt(2, base));
    const d3 = new Date(abonelikNextRetryAt(3, base));
    expect(Math.round((d1.getTime() - base.getTime()) / 86400000)).toBe(1);
    expect(Math.round((d2.getTime() - base.getTime()) / 86400000)).toBe(3);
    expect(Math.round((d3.getTime() - base.getTime()) / 86400000)).toBe(7);
  });
});
