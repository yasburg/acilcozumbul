import { describe, expect, it } from "vitest";
import {
  cekiciBildirimKrediTutari,
  cekiciTalebeBildirildiMi,
  PANEL_BILDIRIM_KREDI,
  PREMIUM_SMS_BILDIRIM_KREDI,
  SMS_BILDIRIM_KREDI,
} from "./ihale";
import { talepFixture } from "@/test/fixtures";

describe("ihale kredi sabitleri", () => {
  it("panel 1, premium SMS 2 kredi", () => {
    expect(PANEL_BILDIRIM_KREDI).toBe(1);
    expect(SMS_BILDIRIM_KREDI).toBe(1);
    expect(PREMIUM_SMS_BILDIRIM_KREDI).toBe(2);
    expect(cekiciBildirimKrediTutari({})).toBe(1);
    expect(cekiciBildirimKrediTutari({ premiumSmsAktif: true })).toBe(2);
  });

  it("bildirilen çekici talebi görebilir", () => {
    const t = talepFixture({ bildirilenCekiciIds: ["c1"] });
    expect(cekiciTalebeBildirildiMi(t, "c1")).toBe(true);
    expect(cekiciTalebeBildirildiMi(t, "c2")).toBe(false);
  });
});
