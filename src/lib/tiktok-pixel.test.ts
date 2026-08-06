import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  TIKTOK_PIXEL_ID,
  TT_HESAP_OLUSTUR_KEY,
  TT_KAYIT_OL_KEY,
  tiktokEventId,
  tiktokPixelBootstrapInline,
  tiktokPixelYapilandirildi,
  tiktokSha256,
  tiktokTelefonE164,
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
    expect(html).toContain("revokeConsent");
    expect(html).toContain(TIKTOK_PIXEL_ID);
    expect(html).toContain(CEREZ_ONAY_STORAGE_KEY);
    expect(html).toContain("zorunlu");
    expect(html).toContain("ttq.page");
  });

  it("event helpers export edilir", async () => {
    const mod = await import("./tiktok-pixel");
    expect(typeof mod.tiktokPixelLead).toBe("function");
    expect(typeof mod.tiktokPixelContact).toBe("function");
    expect(typeof mod.tiktokPixelKayitOl).toBe("function");
    expect(typeof mod.tiktokPixelHesapOlustur).toBe("function");
    expect(typeof mod.tiktokPixelViewContent).toBe("function");
    expect(typeof mod.tiktokPixelSearch).toBe("function");
    expect(typeof mod.tiktokPixelClickButton).toBe("function");
    expect(typeof mod.tiktokPixelIdentify).toBe("function");
  });

  it("telefon E.164 + SHA-256", async () => {
    expect(tiktokTelefonE164("0532 323 32 32")).toBe("+905323233232");
    expect(tiktokTelefonE164("123")).toBeNull();
    const hash = await tiktokSha256("test@example.com");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toBe(await tiktokSha256("test@example.com"));
  });

  it("event_id benzersiz önekli", () => {
    const a = tiktokEventId("CompleteRegistration");
    const b = tiktokEventId("CompleteRegistration");
    expect(a).toContain("CompleteRegistration_");
    expect(a).not.toBe(b);
  });
});

describe("tiktok kayit/hesap once", () => {
  const store = new Map<string, string>();
  const track = vi.fn();
  const identify = vi.fn();

  beforeEach(() => {
    track.mockClear();
    identify.mockClear();
    store.clear();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, String(v));
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    };
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("sessionStorage", storage);
    store.set(CEREZ_ONAY_STORAGE_KEY, "tumu");

    const ttq = Object.assign(vi.fn(), { track, identify, page: vi.fn() });
    vi.stubGlobal("window", {
      ttq,
      localStorage: storage,
      sessionStorage: storage,
      location: { href: "https://example.test/kayit", search: "" },
    });
    vi.stubGlobal("document", { cookie: "", referrer: "" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("kayit ol ve hesap CompleteRegistration; ikinci çağrı atlanır", async () => {
    vi.resetModules();
    const { tiktokPixelKayitOl, tiktokPixelHesapOlustur, tiktokPixelLead } =
      await import("./tiktok-pixel");

    expect(
      await tiktokPixelKayitOl({ phone: "05323233232", externalId: "c1" })
    ).toBe(true);
    expect(await tiktokPixelKayitOl({ phone: "05323233232" })).toBe(false);
    expect(sessionStorage.getItem(TT_KAYIT_OL_KEY)).toBe("1");

    expect(await tiktokPixelHesapOlustur({ externalId: "c1" })).toBe(true);
    expect(await tiktokPixelHesapOlustur({})).toBe(false);
    expect(sessionStorage.getItem(TT_HESAP_OLUSTUR_KEY)).toBe("1");

    await tiktokPixelLead({
      content_name: "musteri_talep",
      phone: "05323233232",
    });

    const events = track.mock.calls.map((c) => c[0]);
    expect(events.filter((e) => e === "CompleteRegistration")).toHaveLength(2);
    expect(events).toContain("Lead");
    expect(identify).toHaveBeenCalled();
  });
});
