import { describe, expect, it } from "vitest";
import {
  GTAG_CONSENT_DENIED,
  GTAG_CONSENT_GRANTED,
  gtagConsentBootstrapInline,
} from "./gtag";
import { CEREZ_ONAY_STORAGE_KEY } from "./cerez-onay";

describe("gtag consent mode (advanced)", () => {
  it("bootstrap consent default + advanced flags içerir", () => {
    const html = gtagConsentBootstrapInline();
    expect(html).toContain("consent");
    expect(html).toContain("default");
    expect(html).toContain("ad_storage");
    expect(html).toContain("ad_user_data");
    expect(html).toContain("ad_personalization");
    expect(html).toContain("analytics_storage");
    expect(html).toContain("wait_for_update");
    expect(html).toContain("url_passthrough");
    expect(html).toContain("ads_data_redaction");
    expect(html).toContain(CEREZ_ONAY_STORAGE_KEY);
    expect(html).toContain("tumu");
  });

  it("v2 parametre setleri tutarlı", () => {
    expect(Object.keys(GTAG_CONSENT_DENIED).sort()).toEqual(
      Object.keys(GTAG_CONSENT_GRANTED).sort()
    );
    expect(GTAG_CONSENT_DENIED.analytics_storage).toBe("denied");
    expect(GTAG_CONSENT_GRANTED.analytics_storage).toBe("granted");
  });
});
