import { describe, expect, it } from "vitest";
import { smsBaseUrl, yerelVeyaOzelAgUrl } from "./sms-base-url";

describe("smsBaseUrl", () => {
  it("LAN IP yerine canlı domain döner", () => {
    expect(smsBaseUrl("https://10.55.33.167:3000")).toBe(
      "https://acilcozumbul.com"
    );
  });

  it("localhost yerine canlı domain döner", () => {
    expect(smsBaseUrl("http://localhost:3000")).toBe(
      "https://acilcozumbul.com"
    );
  });

  it("public domain korunur", () => {
    expect(smsBaseUrl("https://acilcozumbul.com")).toBe(
      "https://acilcozumbul.com"
    );
  });
});

describe("yerelVeyaOzelAgUrl", () => {
  it("10.x private IP algılar", () => {
    expect(yerelVeyaOzelAgUrl("https://10.55.33.167:3000")).toBe(true);
  });
});
