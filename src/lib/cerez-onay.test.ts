import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ANALITIK_CEREZ_ONEKLERI,
  CEREZ_ANALITIK_ISARET_COOKIE,
  CEREZ_ANALITIK_ISARET_LS,
  CEREZ_ONAY_STORAGE_KEY,
  analitikCerezleriSil,
  cerezAnalitikAktif,
  cerezAnalitikIsaretYaz,
  cerezManuelSilmeSenkronize,
  cerezOnayKaydet,
  cerezOnayOku,
} from "./cerez-onay";

describe("cerez-onay opt-out", () => {
  const store = new Map<string, string>();
  let cookieJar = "";

  beforeEach(() => {
    store.clear();
    cookieJar = "";
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    });
    vi.stubGlobal("sessionStorage", {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    });
    vi.stubGlobal("location", { hostname: "www.acilcozumbul.com" });
    const doc = {
      get cookie() {
        return cookieJar;
      },
      set cookie(v: string) {
        const [pair] = v.split(";");
        const eq = pair!.indexOf("=");
        const name = pair!.slice(0, eq).trim();
        const val = pair!.slice(eq + 1).trim();
        const expire =
          /Max-Age=0/i.test(v) || /expires=Thu, 01 Jan 1970/i.test(v);
        const parts = cookieJar
          ? cookieJar.split("; ").filter((p) => !p.startsWith(`${name}=`))
          : [];
        if (!expire && val !== "") {
          parts.push(`${name}=${val}`);
        }
        cookieJar = parts.join("; ");
      },
    };
    vi.stubGlobal("document", doc);
    vi.stubGlobal("window", {
      localStorage: globalThis.localStorage,
      sessionStorage: globalThis.sessionStorage,
      dispatchEvent: () => true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("varsayılan (null) analitik açık", () => {
    expect(cerezOnayOku()).toBeNull();
    expect(cerezAnalitikAktif()).toBe(true);
  });

  it("tumu → açık, zorunlu → kapalı", () => {
    cerezOnayKaydet("tumu");
    expect(cerezAnalitikAktif()).toBe(true);
    expect(cookieJar).toContain(`${CEREZ_ANALITIK_ISARET_COOKIE}=1`);
    expect(store.get(CEREZ_ANALITIK_ISARET_LS)).toBe("1");

    cerezOnayKaydet("zorunlu");
    expect(cerezAnalitikAktif()).toBe(false);
    expect(store.get(CEREZ_ONAY_STORAGE_KEY)).toBe("zorunlu");
    expect(store.get(CEREZ_ANALITIK_ISARET_LS)).toBeUndefined();
    expect(cookieJar).not.toContain(`${CEREZ_ANALITIK_ISARET_COOKIE}=`);
  });

  it("zorunlu analitik çerezlerini siler", () => {
    cookieJar = "_ga=GA1; _fbp=fb.1; session=abc";
    cerezOnayKaydet("zorunlu");
    expect(cookieJar).not.toContain("_ga=");
    expect(cookieJar).not.toContain("_fbp=");
    expect(cookieJar).toContain("session=abc");
  });

  it("manuel silme → zorunlu", () => {
    cerezOnayKaydet("tumu");
    expect(cerezManuelSilmeSenkronize()).toBe(false);

    /* Kullanıcı çerezleri sildi, LS işareti kaldı */
    cookieJar = "";
    expect(cerezManuelSilmeSenkronize()).toBe(true);
    expect(cerezOnayOku()).toBe("zorunlu");
    expect(cerezAnalitikAktif()).toBe(false);
  });

  it("işaret yokken ilk senkron silme sayılmaz", () => {
    expect(cerezManuelSilmeSenkronize()).toBe(false);
    expect(cerezOnayOku()).toBeNull();
    expect(store.get(CEREZ_ANALITIK_ISARET_LS)).toBe("1");
    expect(cookieJar).toContain(CEREZ_ANALITIK_ISARET_COOKIE);
  });

  it("analitik önek listesi işaret çerezini içerir", () => {
    expect(ANALITIK_CEREZ_ONEKLERI).toContain(CEREZ_ANALITIK_ISARET_COOKIE);
    cerezAnalitikIsaretYaz();
    analitikCerezleriSil();
    expect(cookieJar).not.toContain(`${CEREZ_ANALITIK_ISARET_COOKIE}=`);
  });
});
