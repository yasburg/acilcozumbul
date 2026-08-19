import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  aktifEfaturaMukellefiMi,
  efaturaMukellefiSorgula,
  faturaBelgeTipiBelirle,
} from "./mukellef";
import { trendyolEfaturamTokenOnbellekTemizle } from "./auth";

describe("faturaBelgeTipiBelirle", () => {
  it("kurumsal mükellef → e-fatura", () => {
    expect(
      faturaBelgeTipiBelirle({ kurumsal: true, mukellef: true })
    ).toBe("e-fatura");
  });

  it("kurumsal ama mükellef değil → e-arşiv", () => {
    expect(
      faturaBelgeTipiBelirle({ kurumsal: true, mukellef: false })
    ).toBe("e-arsiv");
  });

  it("bireysel → e-arşiv", () => {
    expect(
      faturaBelgeTipiBelirle({ kurumsal: false, mukellef: true })
    ).toBe("e-arsiv");
  });
});

describe("aktifEfaturaMukellefiMi", () => {
  it("INVOICE alias ve silinmemiş kayıt mükellef sayılır", () => {
    expect(
      aktifEfaturaMukellefiMi([
        {
          taxId: "1234567890",
          alias: "urn:mail:default@example.com",
          title: "Ornek A.S.",
          aliasType: "INVOICE",
        },
      ])
    ).toBe(true);
  });

  it("silinmiş INVOICE alias mükellef sayılmaz", () => {
    expect(
      aktifEfaturaMukellefiMi([
        {
          taxId: "1234567890",
          alias: "urn:mail:default@example.com",
          title: "Ornek A.S.",
          aliasType: "INVOICE",
          deletedAt: "2024-01-01T00:00:00.000Z",
        },
      ])
    ).toBe(false);
  });

  it("sadece irsaliye alias mükellef sayılmaz", () => {
    expect(
      aktifEfaturaMukellefiMi([
        {
          taxId: "1234567890",
          alias: "urn:mail:default@example.com",
          title: "Ornek A.S.",
          aliasType: "DESPATCH_ADVICE",
        },
      ])
    ).toBe(false);
  });
});

describe("efaturaMukellefiSorgula", () => {
  const prevEmail = process.env.TRENDYOL_EFATURAM_EMAIL;
  const prevPassword = process.env.TRENDYOL_EFATURAM_PASSWORD;
  const prevBase = process.env.TRENDYOL_EFATURAM_API_BASE_URL;

  beforeEach(() => {
    trendyolEfaturamTokenOnbellekTemizle();
    process.env.TRENDYOL_EFATURAM_EMAIL = "test@example.com";
    process.env.TRENDYOL_EFATURAM_PASSWORD = "secret";
    process.env.TRENDYOL_EFATURAM_API_BASE_URL =
      "https://stage-apigateway.trendyolefaturam.com";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    trendyolEfaturamTokenOnbellekTemizle();
    process.env.TRENDYOL_EFATURAM_EMAIL = prevEmail;
    process.env.TRENDYOL_EFATURAM_PASSWORD = prevPassword;
    process.env.TRENDYOL_EFATURAM_API_BASE_URL = prevBase;
  });

  it("404 yanıtında mükellef değil döner", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL, init?: RequestInit) => {
        const u = String(url);
        if (u.endsWith("/api/auth/signin")) {
          return new Response("{}", {
            status: 200,
            headers: { "x-access-token": "test-token" },
          });
        }
        if (u.includes("/api/invoice/taxpayers/9830915457")) {
          const headers = new Headers(init?.headers);
          expect(headers.get("x-access-token")).toBe("test-token");
          return new Response("", { status: 404 });
        }
        throw new Error(`Beklenmeyen URL: ${u}`);
      })
    );

    const sonuc = await efaturaMukellefiSorgula("9830915457");
    expect(sonuc.ok).toBe(true);
    if (sonuc.ok) {
      expect(sonuc.mukellef).toBe(false);
      expect(sonuc.vergiNo).toBe("9830915457");
    }
  });

  it("200 yanıtında aktif INVOICE alias mükellef döner", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        const u = String(url);
        if (u.endsWith("/api/auth/signin")) {
          return new Response("{}", {
            status: 200,
            headers: { "x-access-token": "test-token" },
          });
        }
        if (u.includes("/api/invoice/taxpayers/8003199330")) {
          return new Response(
            JSON.stringify([
              {
                taxId: "8003199330",
                alias: "urn:mail:defaultpk@example.com",
                title: "Test Ltd.",
                aliasType: "INVOICE",
              },
            ]),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }
        throw new Error(`Beklenmeyen URL: ${u}`);
      })
    );

    const sonuc = await efaturaMukellefiSorgula("8003199330");
    expect(sonuc.ok).toBe(true);
    if (sonuc.ok) {
      expect(sonuc.mukellef).toBe(true);
      expect(sonuc.unvan).toBe("Test Ltd.");
    }
  });
});
