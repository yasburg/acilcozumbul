import { describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("fatura ve faturalar yollarını disallow eder", () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const disallow = rules.flatMap((rule) => {
      const d = rule.disallow;
      if (!d) return [];
      return Array.isArray(d) ? d : [d];
    });
    expect(disallow).toContain("/fatura");
    expect(disallow).toContain("/cekici/faturalar");
  });
});
