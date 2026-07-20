import { describe, expect, it } from "vitest";
import {
  META_PIXEL_ID,
  metaPixelBootstrapInline,
  metaPixelYapilandirildi,
} from "./meta-pixel";
import { CEREZ_ONAY_STORAGE_KEY } from "./cerez-onay";

describe("meta pixel", () => {
  it("varsayılan pixel kimliği tanımlı", () => {
    expect(metaPixelYapilandirildi()).toBe(true);
    expect(META_PIXEL_ID).toBe("1552497653179792");
  });

  it("bootstrap revoke + init + çerez grant içerir", () => {
    const html = metaPixelBootstrapInline(META_PIXEL_ID);
    expect(html).toContain("fbevents.js");
    expect(html).toContain("consent");
    expect(html).toContain("revoke");
    expect(html).toContain(META_PIXEL_ID);
    expect(html).toContain(CEREZ_ONAY_STORAGE_KEY);
    expect(html).toContain("PageView");
  });

  it("Lead ve CompleteRegistration export edilir", async () => {
    const mod = await import("./meta-pixel");
    expect(typeof mod.metaPixelLead).toBe("function");
    expect(typeof mod.metaPixelCompleteRegistration).toBe("function");
  });
});
