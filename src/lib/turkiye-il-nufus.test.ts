import { describe, expect, it } from "vitest";
import {
  sehirYolYardimTalepMetni,
  sehirYolYardimTalepTahmini,
  sehirdeYazi,
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
});
