import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  chromeAcUrl,
  chromeIciMi,
  cihazPlatformu,
} from "./konum-client";

describe("chromeAc", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("iOS Safari için googlechromes linki üretir", () => {
    vi.stubGlobal("navigator", {
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
    vi.stubGlobal("window", {
      location: {
        href: "https://www.acilcozumbul.com/?x=1",
      },
    });
    expect(cihazPlatformu()).toBe("ios");
    expect(chromeIciMi()).toBe(false);
    expect(chromeAcUrl("https://www.acilcozumbul.com/kayit")).toBe(
      "googlechromes://www.acilcozumbul.com/kayit"
    );
  });

  it("Android WebView için Chrome intent üretir", () => {
    vi.stubGlobal("navigator", {
      userAgent:
        "Mozilla/5.0 (Linux; Android 13; Pixel 7 Build/TQ3A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36",
    });
    vi.stubGlobal("window", {
      location: { href: "https://www.acilcozumbul.com/" },
    });
    expect(cihazPlatformu()).toBe("android");
    expect(chromeIciMi()).toBe(false);
    const url = chromeAcUrl("https://www.acilcozumbul.com/path?a=1");
    expect(url).toContain("intent://www.acilcozumbul.com/path?a=1#Intent");
    expect(url).toContain("package=com.android.chrome");
    expect(url).toContain("scheme=https");
  });

  it("zaten Chrome’daysa null döner", () => {
    vi.stubGlobal("navigator", {
      userAgent:
        "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    });
    vi.stubGlobal("window", {
      location: { href: "https://www.acilcozumbul.com/" },
    });
    expect(chromeIciMi()).toBe(true);
    expect(chromeAcUrl()).toBeNull();
  });

  it("masaüstünde null döner", () => {
    vi.stubGlobal("navigator", {
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    vi.stubGlobal("window", {
      location: { href: "https://www.acilcozumbul.com/" },
    });
    expect(cihazPlatformu()).toBe("other");
    expect(chromeAcUrl()).toBeNull();
  });
});
