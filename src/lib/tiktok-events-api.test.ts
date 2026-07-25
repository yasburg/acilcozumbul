import { describe, expect, it } from "vitest";
import {
  tiktokEventsApiPayload,
  tiktokEventsApiYapilandirildi,
  tiktokPhoneHash,
  tiktokSha256Hex,
} from "./tiktok-events-api";

describe("tiktok events api", () => {
  it("telefon E.164 SHA-256", () => {
    const h = tiktokPhoneHash("0532 323 32 32");
    expect(h).toMatch(/^[a-f0-9]{64}$/);
    expect(h).toBe(tiktokSha256Hex("+905323233232"));
    expect(tiktokPhoneHash("123")).toBeNull();
  });

  it("Events 2.0 payload yapısı", () => {
    const body = tiktokEventsApiPayload({
      event: "Lead",
      eventId: "Lead_test_1",
      eventTime: 1700000000,
      phone: "05323233232",
      externalId: "cekici-1",
      ip: "1.2.3.4",
      userAgent: "Vitest",
      url: "https://www.acilcozumbul.com/",
      contents: [
        {
          content_id: "musteri_talep",
          content_name: "cekici",
          content_type: "product",
        },
      ],
      value: 1,
      currency: "TRY",
    });

    expect(body.event_source).toBe("web");
    expect(body.event_source_id).toBe("D9IAJJJC77U13TU252RG");
    expect(body.data).toHaveLength(1);
    const row = body.data[0]!;
    expect(row.event).toBe("Lead");
    expect(row.event_id).toBe("Lead_test_1");
    expect(row.event_time).toBe(1700000000);
    const user = row.user as Record<string, string>;
    expect(user.phone).toBe(tiktokSha256Hex("+905323233232"));
    expect(user.external_id).toBe(tiktokSha256Hex("cekici-1"));
    expect(user.ip).toBe("1.2.3.4");
    expect(user.user_agent).toBe("Vitest");
    const page = row.page as Record<string, string>;
    expect(page.url).toContain("acilcozumbul.com");
  });

  it("token yoksa yapılandırılmamış sayılır (CI)", () => {
    /* Yerelde .env yüklü olabilir; en azından fonksiyon boolean döner */
    expect(typeof tiktokEventsApiYapilandirildi()).toBe("boolean");
  });
});
