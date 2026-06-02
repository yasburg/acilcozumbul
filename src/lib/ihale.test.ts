import { describe, expect, it } from "vitest";
import { cekiciTalebeBildirildiMi, SMS_BILDIRIM_KREDI } from "./ihale";
import { talepFixture } from "@/test/fixtures";

describe("ihale kredi sabitleri", () => {
  it("SMS bildirimi 1 kredi", () => {
    expect(SMS_BILDIRIM_KREDI).toBe(1);
  });

  it("bildirilen çekici talebi görebilir", () => {
    const t = talepFixture({ bildirilenCekiciIds: ["c1"] });
    expect(cekiciTalebeBildirildiMi(t, "c1")).toBe(true);
    expect(cekiciTalebeBildirildiMi(t, "c2")).toBe(false);
  });
});
