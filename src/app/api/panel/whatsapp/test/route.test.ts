import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";
import * as whatsappProvider from "@/lib/whatsapp-provider";

describe("Panel WhatsApp Test API Route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("GET endpoint'i WhatsApp durumunu döner", async () => {
    process.env.WHATSAPP_TOKEN = "EAAGtest";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123456789012";
    process.env.WHATSAPP_ENABLED = "true";

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.aktif).toBe(true);
    expect(data.yapilandirildi).toBe(true);
    expect(data.phoneNumberId).toBe("1234...9012");
  });

  it("POST geçerli telefonla test mesajı gönderir", async () => {
    process.env.WHATSAPP_TOKEN = "EAAGtest";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123456789012";

    vi.spyOn(whatsappProvider, "sendWhatsAppText").mockResolvedValue({
      basarili: true,
      saglayici: "whatsapp",
      mesajId: "wamid.test1234",
    });

    const req = new NextRequest("https://example.com/api/panel/whatsapp/test", {
      method: "POST",
      body: JSON.stringify({
        telefon: "05321112233",
        mesaj: "Test mesajı",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.basarili).toBe(true);
    expect(data.mesajId).toBe("wamid.test1234");
  });

  it("POST şablon seçildiğinde sendWhatsAppTemplate çağırır", async () => {
    process.env.WHATSAPP_TOKEN = "EAAGtest";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123456789012";

    const spy = vi
      .spyOn(whatsappProvider, "sendWhatsAppTemplate")
      .mockResolvedValue({
        basarili: true,
        saglayici: "whatsapp",
        mesajId: "wamid.template123",
      });

    const req = new NextRequest("https://example.com/api/panel/whatsapp/test", {
      method: "POST",
      body: JSON.stringify({
        telefon: "05321112233",
        sablon: "otp",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.basarili).toBe(true);
    expect(spy).toHaveBeenCalled();
  });
});
