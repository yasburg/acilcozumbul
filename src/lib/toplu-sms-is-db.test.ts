import { describe, expect, it } from "vitest";
import {
  topluSmsPartilereBol,
  topluSmsPartiBeklemeMs,
  topluSmsTempoNormalize,
} from "./toplu-sms-tempo";

describe("toplu-sms arka plan kuyruk yardımcıları", () => {
  it("tempo ile parti sayısı tutarlı", () => {
    const tempo = topluSmsTempoNormalize({
      partiBoyutu: 10,
      beklemeSn: 60,
      jitterOran: 0,
    });
    const partiler = topluSmsPartilereBol(
      Array.from({ length: 25 }, (_, i) => i),
      tempo.partiBoyutu
    );
    expect(partiler).toHaveLength(3);
    expect(partiler[0]).toHaveLength(10);
    expect(partiler[2]).toHaveLength(5);
  });

  it("jitter kapalıyken bekleme sabit", () => {
    const ms = topluSmsPartiBeklemeMs({
      partiBoyutu: 10,
      beklemeSn: 30,
      jitterOran: 0,
    });
    expect(ms).toBe(30_000);
  });
});
