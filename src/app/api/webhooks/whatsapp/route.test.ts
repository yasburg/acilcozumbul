import { describe, expect, it } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

describe("WhatsApp Webhook Route", () => {
  it("GET doğru verify_token ile challenge string döner", async () => {
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = "my_secret_token";

    const req = new NextRequest(
      "https://example.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=my_secret_token&hub.challenge=test_challenge_123"
    );

    const res = await GET(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("test_challenge_123");
  });

  it("GET hatalı verify_token ile 403 Forbidden döner", async () => {
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = "my_secret_token";

    const req = new NextRequest(
      "https://example.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=123"
    );

    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("POST durum güncellemelerini sorunsuz işler ve 200 döner", async () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "123",
          changes: [
            {
              value: {
                messaging_product: "whatsapp",
                statuses: [
                  {
                    id: "wamid.123",
                    status: "delivered",
                    recipient_id: "905321112233",
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const req = new NextRequest("https://example.com/api/webhooks/whatsapp", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("success");
  });
});
