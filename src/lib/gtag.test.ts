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

  it("Ads fiyat teklifi dönüşüm send_to tanımlı", async () => {
    const { GOOGLE_ADS_DONUSUM_FIYAT_TEKLIFI, GOOGLE_ADS_ID } = await import(
      "./gtag"
    );
    expect(GOOGLE_ADS_ID).toBe("AW-18328392362");
    expect(GOOGLE_ADS_DONUSUM_FIYAT_TEKLIFI).toContain("Msc0CNjLnNMcEKql1KNE");
  });

  it("Ads kaydolma dönüşüm send_to tanımlı", async () => {
    const { GOOGLE_ADS_DONUSUM_KAYDOLMA, gtagTelefonE164 } = await import(
      "./gtag"
    );
    expect(GOOGLE_ADS_DONUSUM_KAYDOLMA).toContain("Y9juCP_Rm9McEKql1KNE");
    expect(gtagTelefonE164("0532 323 32 32")).toBe("+905323233232");
  });

  it("Ads kaydolma satış hedefi send_to tanımlı", async () => {
    const { GOOGLE_ADS_DONUSUM_KAYDOLMA_SATIS } = await import("./gtag");
    expect(GOOGLE_ADS_DONUSUM_KAYDOLMA_SATIS).toBe(
      "AW-18328392362/7LrICKm8w9ccEKql1KNE"
    );
  });

  it("Ads kredi sepet dönüşüm send_to tanımlı", async () => {
    const { GOOGLE_ADS_DONUSUM_KREDI_SEPET } = await import("./gtag");
    expect(GOOGLE_ADS_DONUSUM_KREDI_SEPET).toBe(
      "AW-18328392362/AezgCJW_q9ccEKql1KNE"
    );
  });

  it("Ads kredi satın alma dönüşüm send_to tanımlı", async () => {
    const { GOOGLE_ADS_DONUSUM_KREDI_SATIN_ALMA } = await import("./gtag");
    expect(GOOGLE_ADS_DONUSUM_KREDI_SATIN_ALMA).toBe(
      "AW-18328392362/zm-FCJSzw9ccEKql1KNE"
    );
  });
});
