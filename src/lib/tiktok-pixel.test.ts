import { describe, expect, it } from "vitest";
import {
  TIKTOK_PIXEL_ID,
  tiktokPixelBootstrapInline,
  tiktokPixelYapilandirildi,
} from "./tiktok-pixel";
import { CEREZ_ONAY_STORAGE_KEY } from "./cerez-onay";

describe("tiktok pixel", () => {
  it("varsayılan pixel kimliği tanımlı", () => {
    expect(tiktokPixelYapilandirildi()).toBe(true);
    expect(TIKTOK_PIXEL_ID).toBe("D9IAJJJC77U13TU252RG");
  });

  it("bootstrap holdConsent + load + çerez grant içerir", () => {
    const html = tiktokPixelBootstrapInline(TIKTOK_PIXEL_ID);
    expect(html).toContain("analytics.tiktok.com");
    expect(html).toContain("holdConsent");
    expect(html).toContain("grantConsent");
    expect(html).toContain(TIKTOK_PIXEL_ID);
    expect(html).toContain(CEREZ_ONAY_STORAGE_KEY);
    expect(html).toContain("ttq.page");
  });

  it("Lead ve CompleteRegistration export edilir", async () => {
    const mod = await import("./tiktok-pixel");
    expect(typeof mod.tiktokPixelLead).toBe("function");
    expect(typeof mod.tiktokPixelCompleteRegistration).toBe("function");
  });
});
