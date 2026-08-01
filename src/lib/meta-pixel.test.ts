import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  META_PIXEL_ID,
  metaAdvancedMatchingHazirla,
  metaPixelBootstrapInline,
  metaPixelYapilandirildi,
  metaSha256,
  metaTelefonNormalize,
} from "./meta-pixel";
import { CEREZ_ONAY_STORAGE_KEY } from "./cerez-onay";

describe("meta pixel", () => {
  it("varsayılan pixel kimliği tanımlı", () => {
    expect(metaPixelYapilandirildi()).toBe(true);
    expect(META_PIXEL_ID).toBe("1552497653179792");
  });

  it("bootstrap init + çerez grant/revoke içerir (PageView yok — React)", () => {
    const html = metaPixelBootstrapInline(META_PIXEL_ID);
    expect(html).toContain("fbevents.js");
    expect(html).toContain("consent");
    expect(html).toContain("revoke");
    expect(html).toContain("grant");
    expect(html).toContain(META_PIXEL_ID);
    expect(html).toContain(CEREZ_ONAY_STORAGE_KEY);
    expect(html).toContain("zorunlu");
    expect(html).not.toContain("PageView");
  });

  it("Lead ve CompleteRegistration export edilir", async () => {
    const mod = await import("./meta-pixel");
    expect(typeof mod.metaPixelLead).toBe("function");
    expect(typeof mod.metaPixelCompleteRegistration).toBe("function");
  });

  it("telefon Meta formatına normalize eder (90…, + yok)", () => {
    expect(metaTelefonNormalize("0532 323 32 32")).toBe("905323233232");
    expect(metaTelefonNormalize("+90 532 323 32 32")).toBe("905323233232");
    expect(metaTelefonNormalize("123")).toBeNull();
  });

  it("SHA-256 hex üretir", async () => {
    const h = await metaSha256("905323233232");
    expect(h).toMatch(/^[a-f0-9]{64}$/);
    expect(h).toBe(await metaSha256("905323233232"));
  });

  it("Advanced Matching ph / fn / country hash’ler", async () => {
    const m = await metaAdvancedMatchingHazirla({
      phone: "05323233232",
      firstName: "Ali",
      lastName: "Veli",
      externalId: "cekici-1",
    });
    expect(m.ph).toBe(await metaSha256("905323233232"));
    expect(m.fn).toBe(await metaSha256("ali"));
    expect(m.ln).toBe(await metaSha256("veli"));
    expect(m.external_id).toBe(await metaSha256("cekici-1"));
    expect(m.country).toBe(await metaSha256("tr"));
    expect(m.ph).not.toContain("905");
  });
});

describe("metaPixelCompleteRegistration advanced matching", () => {
  const fbq = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("window", {
      fbq,
      localStorage: {
        getItem: () => "tumu",
      },
    });
    vi.stubGlobal("localStorage", {
      getItem: () => "tumu",
    });
    fbq.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("init + track sırasında ph gönderir", async () => {
    vi.resetModules();
    vi.doMock("./cerez-onay", () => ({
      cerezAnalitikAktif: () => true,
    }));
    const { metaPixelCompleteRegistration, metaSha256 } = await import(
      "./meta-pixel"
    );
    await metaPixelCompleteRegistration({
      content_name: "cekici_kayit",
      phone: "05323233232",
    });
    expect(fbq).toHaveBeenCalled();
    const initCall = fbq.mock.calls.find(
      (c) => c[0] === "init" && typeof c[2] === "object"
    );
    expect(initCall?.[2]).toMatchObject({
      ph: await metaSha256("905323233232"),
    });
    expect(
      fbq.mock.calls.some(
        (c) => c[0] === "track" && c[1] === "CompleteRegistration"
      )
    ).toBe(true);
    const trackCall = fbq.mock.calls.find(
      (c) => c[0] === "track" && c[1] === "CompleteRegistration"
    );
    expect(trackCall?.[2]).toMatchObject({
      value: 1.0,
      currency: "TRY",
    });
  });

  it("PageView saklı telefondan AM uygular", async () => {
    vi.resetModules();
    vi.doMock("./cerez-onay", () => ({
      cerezAnalitikAktif: () => true,
    }));
    const store = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    });
    const {
      metaPixelPageView,
      metaUserDataSakla,
      metaSha256,
      META_USER_DATA_KEY,
    } = await import("./meta-pixel");
    metaUserDataSakla({ phone: "05323233232" });
    expect(store.get(META_USER_DATA_KEY)).toBeTruthy();
    await metaPixelPageView();
    const initCall = fbq.mock.calls.find(
      (c) => c[0] === "init" && typeof c[2] === "object"
    );
    expect(initCall?.[2]).toMatchObject({
      ph: await metaSha256("905323233232"),
    });
    expect(
      fbq.mock.calls.some((c) => c[0] === "track" && c[1] === "PageView")
    ).toBe(true);
  });
});
