import { describe, expect, it } from "vitest";
import { smsBaseUrl, smsHostNormalize, yerelVeyaOzelAgUrl } from "./sms-base-url";

describe("smsBaseUrl", () => {
  it("LAN IP yerine www canlı domain döner", () => {
    expect(smsBaseUrl("https://10.55.33.167:3000")).toBe(
      "https://www.acilcozumbul.com"
    );
  });

  it("localhost yerine www canlı domain döner", () => {
    expect(smsBaseUrl("http://localhost:3000")).toBe(
      "https://www.acilcozumbul.com"
    );
  });

  it("localhost:8080 (proxy Host) yerine www canlı domain döner", () => {
    expect(smsBaseUrl("https://localhost:8080")).toBe(
      "https://www.acilcozumbul.com"
    );
  });

  it("apex domain www'ye normalize edilir", () => {
    expect(smsBaseUrl("https://acilcozumbul.com")).toBe(
      "https://www.acilcozumbul.com"
    );
  });

  it("www domain korunur", () => {
    expect(smsBaseUrl("https://www.acilcozumbul.com")).toBe(
      "https://www.acilcozumbul.com"
    );
  });
});

describe("smsHostNormalize", () => {
  it("apex hostu www yapar", () => {
    expect(smsHostNormalize("https://acilcozumbul.com")).toBe(
      "https://www.acilcozumbul.com"
    );
  });
});

describe("yerelVeyaOzelAgUrl", () => {
  it("10.x private IP algılar", () => {
    expect(yerelVeyaOzelAgUrl("https://10.55.33.167:3000")).toBe(true);
  });
});
