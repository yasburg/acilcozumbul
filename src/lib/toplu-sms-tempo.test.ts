import { describe, expect, it } from "vitest";
import {
  topluSmsPartilereBol,
  topluSmsTahminiSureSn,
  topluSmsTempoNormalize,
} from "./toplu-sms-tempo";

describe("toplu-sms-tempo", () => {
  it("normalize sınırları uygular", () => {
    expect(topluSmsTempoNormalize({ partiBoyutu: 0, beklemeSn: -1 })).toEqual({
      partiBoyutu: 1,
      beklemeSn: 0,
      jitterOran: 0,
    });
    expect(
      topluSmsTempoNormalize({ partiBoyutu: 99, beklemeSn: 999, jitterOran: 1 })
    ).toEqual({
      partiBoyutu: 50,
      beklemeSn: 600,
      jitterOran: 0.5,
    });
  });

  it("listeyi partilere böler", () => {
    expect(topluSmsPartilereBol([1, 2, 3, 4, 5], 2)).toEqual([
      [1, 2],
      [3, 4],
      [5],
    ]);
  });

  it("tahmini süreyi hesaplar", () => {
    expect(
      topluSmsTahminiSureSn(30, {
        partiBoyutu: 10,
        beklemeSn: 60,
        jitterOran: 0,
      })
    ).toBe(120);
  });
});
