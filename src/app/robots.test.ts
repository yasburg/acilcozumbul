import { describe, expect, it, vi } from "vitest";
import robots from "./robots";

function tumDisallow(): string[] {
  const r = robots();
  const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
  return rules.flatMap((rule) => {
    const d = rule.disallow;
    if (!d) return [];
    return Array.isArray(d) ? d : [d];
  });
}

describe("robots", () => {
  it("fatura ve faturalar yollarını disallow eder", () => {
    const disallow = tumDisallow();
    expect(disallow).toContain("/fatura");
    expect(disallow).toContain("/cekici/faturalar");
  });

  it("test ve funnel yollarını disallow eder", () => {
    const disallow = tumDisallow();
    expect(disallow).toContain("/a");
    expect(disallow).toContain("/b");
    expect(disallow).toContain("/kayit/");
    expect(disallow).toContain("/talep-olustur");
    expect(disallow).toContain("/sms50");
    expect(disallow).toContain("/demo/");
    expect(disallow).toContain("/cekici/giris");
    expect(disallow).toContain("/cekici/kayit");
  });

  it("staging ortamında tüm siteyi disallow eder", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "staging");
    vi.resetModules();
    const { default: robotsStaging } = await import("./robots");
    const r = robotsStaging();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const disallow = rules.flatMap((rule) => {
      const d = rule.disallow;
      if (!d) return [];
      return Array.isArray(d) ? d : [d];
    });
    expect(disallow).toContain("/");
    vi.unstubAllEnvs();
  });
});
