import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  getWhatsAppConfig,
  metaHataAciklamasi,
  sendWhatsAppTemplate,
  sendWhatsAppText,
  telefonWhatsAppFormat,
  whatsappAktifMi,
  whatsappNumaraIcinAktifMi,
  whatsappYapilandirildi,
  WhatsAppTemplates,
} from "./whatsapp-provider";

describe("WhatsApp Provider", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("telefonWhatsAppFormat", () => {
    it("0532... formatındaki numarayı 90532... yapar", () => {
      expect(telefonWhatsAppFormat("05321234567")).toBe("905321234567");
      expect(telefonWhatsAppFormat("0544 987 65 43")).toBe("905449876543");
    });

    it("532... formatındaki numarayı 90532... yapar", () => {
      expect(telefonWhatsAppFormat("5321234567")).toBe("905321234567");
    });

    it("+90532... veya 90532... formatını doğru normalleştirir", () => {
      expect(telefonWhatsAppFormat("+90 532 123 45 67")).toBe("905321234567");
      expect(telefonWhatsAppFormat("905321234567")).toBe("905321234567");
    });

    it("Geçersiz telefonlar için null döner", () => {
      expect(telefonWhatsAppFormat("02121234567")).toBeNull();
      expect(telefonWhatsAppFormat("12345")).toBeNull();
      expect(telefonWhatsAppFormat("")).toBeNull();
    });
  });

  describe("Konfigürasyon Kontrolleri", () => {
    it("Token veya Phone ID yoksa whatsappYapilandirildi false döner", () => {
      delete process.env.WHATSAPP_TOKEN;
      delete process.env.WHATSAPP_PHONE_NUMBER_ID;
      expect(whatsappYapilandirildi()).toBe(false);
      expect(whatsappAktifMi()).toBe(false);
    });

    it("Token ve Phone ID varsa whatsappYapilandirildi true döner", () => {
      process.env.WHATSAPP_TOKEN = "EAAGtesttoken";
      process.env.WHATSAPP_PHONE_NUMBER_ID = "1029384756";
      expect(whatsappYapilandirildi()).toBe(true);
    });

    it("WHATSAPP_ENABLED=true veya NOTIFICATION_CHANNEL=whatsapp ise aktif olur", () => {
      process.env.WHATSAPP_TOKEN = "EAAGtesttoken";
      process.env.WHATSAPP_PHONE_NUMBER_ID = "1029384756";

      process.env.WHATSAPP_ENABLED = "true";
      expect(whatsappAktifMi()).toBe(true);

      process.env.WHATSAPP_ENABLED = "false";
      process.env.NOTIFICATION_CHANNEL = "whatsapp";
      expect(whatsappAktifMi()).toBe(true);
    });

    it("WHATSAPP_TEST_PHONES tanımlandığında sadece o numaralar için aktif olur", () => {
      process.env.WHATSAPP_TOKEN = "EAAGtesttoken";
      process.env.WHATSAPP_PHONE_NUMBER_ID = "1029384756";
      process.env.WHATSAPP_ENABLED = "false";
      process.env.WHATSAPP_TEST_PHONES = "05321112233, 05449998877";

      expect(whatsappNumaraIcinAktifMi("05321112233")).toBe(true);
      expect(whatsappNumaraIcinAktifMi("5321112233")).toBe(true);
      expect(whatsappNumaraIcinAktifMi("05551234567")).toBe(false);
    });
  });

  describe("metaHataAciklamasi", () => {
    it("Bilinen kodları Türkçe olarak açıklar", () => {
      expect(metaHataAciklamasi(131047)).toContain("24 saat kuralı aşımı");
      expect(metaHataAciklamasi(190)).toContain("Geçersiz veya süresi dolmuş");
      expect(metaHataAciklamasi(100)).toContain("Geçersiz parametre");
    });
  });

  describe("WhatsAppTemplates", () => {
    it("OTP şablonunu doğru parametrelerle oluşturur", () => {
      const tpl = WhatsAppTemplates.otp("654321");
      expect(tpl.name).toBe("dogrulama_kodu");
      expect(tpl.components?.[0].parameters[0].text).toBe("654321");
    });

    it("Yeni talep şablonunu oluşturur", () => {
      const tpl = WhatsAppTemplates.yeniTalep("Kadıköy / İstanbul", "https://example.com/t/1");
      expect(tpl.name).toBe("yeni_talep_cekici");
      expect(tpl.components?.[0].parameters[0].text).toBe("Kadıköy / İstanbul");
      expect(tpl.components?.[0].parameters[1].text).toBe("https://example.com/t/1");
    });
  });

  describe("sendWhatsAppText ve sendWhatsAppTemplate HTTP Çağrıları", () => {
    it("Başarılı HTTP çağrısında mesajId döner", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            messaging_product: "whatsapp",
            contacts: [{ input: "905321112233", wa_id: "905321112233" }],
            messages: [{ id: "wamid.HBgLMTIzNDU2" }],
          }),
      });
      global.fetch = mockFetch;

      const res = await sendWhatsAppText("05321112233", "Merhaba test", {
        token: "fake-token",
        phoneNumberId: "12345",
        enabled: true,
        fallbackToSms: true,
      });

      expect(res.basarili).toBe(true);
      expect(res.mesajId).toBe("wamid.HBgLMTIzNDU2");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://graph.facebook.com/v22.0/12345/messages",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token",
          }),
        })
      );
    });

    it("Meta hata döndüğünde hata açıklaması ve kodunu ayrıştırır", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () =>
          JSON.stringify({
            error: {
              message: "Message failed to send because more than 24 hours have passed",
              type: "OAuthException",
              code: 131047,
              fbtrace_id: "xyz123",
            },
          }),
      });
      global.fetch = mockFetch;

      const res = await sendWhatsAppText("05321112233", "Merhaba", {
        token: "fake-token",
        phoneNumberId: "12345",
        enabled: true,
        fallbackToSms: true,
      });

      expect(res.basarili).toBe(false);
      expect(res.hataKodu).toBe(131047);
      expect(res.hata).toContain("24 saat kuralı aşımı");
    });
  });
});
