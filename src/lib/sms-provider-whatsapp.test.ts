import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { sendSms, smsDurumu } from "./sms-provider";
import * as whatsappProvider from "./whatsapp-provider";

vi.mock("./db", () => ({
  addSmsKaydi: vi.fn().mockResolvedValue(undefined),
  getCekiciById: vi.fn().mockResolvedValue(null),
  updateCekici: vi.fn().mockResolvedValue(undefined),
}));

describe("sendSms WhatsApp Entegrasyonu", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("WhatsApp aktif ve başarılı olduğunda saglayici whatsapp döner", async () => {
    process.env.WHATSAPP_TOKEN = "EAAGtesttoken";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123456789";
    process.env.WHATSAPP_ENABLED = "true";

    const sendWhatsAppTextSpy = vi
      .spyOn(whatsappProvider, "sendWhatsAppText")
      .mockResolvedValue({
        basarili: true,
        saglayici: "whatsapp",
        mesajId: "wamid.123",
      });

    const sonuc = await sendSms("05321112233", "Test mesajı", {
      aliciTipi: "musteri",
    });

    expect(sonuc.basarili).toBe(true);
    expect(sonuc.saglayici).toBe("whatsapp");
    expect(sonuc.mesajId).toBe("wamid.123");
    expect(sendWhatsAppTextSpy).toHaveBeenCalledWith(
      "05321112233",
      "Test mesajı",
      expect.anything()
    );
  });

  it("WhatsApp şablonu verildiğinde sendWhatsAppTemplate çağrılır", async () => {
    process.env.WHATSAPP_TOKEN = "EAAGtesttoken";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123456789";
    process.env.WHATSAPP_ENABLED = "true";

    const sendWhatsAppTemplateSpy = vi
      .spyOn(whatsappProvider, "sendWhatsAppTemplate")
      .mockResolvedValue({
        basarili: true,
        saglayici: "whatsapp",
        mesajId: "wamid.tpl123",
      });

    const template = whatsappProvider.WhatsAppTemplates.otp("654321");

    const sonuc = await sendSms("05321112233", "654321 kodunuz", {
      aliciTipi: "musteri",
      whatsappTemplate: template,
    });

    expect(sonuc.basarili).toBe(true);
    expect(sonuc.saglayici).toBe("whatsapp");
    expect(sendWhatsAppTemplateSpy).toHaveBeenCalledWith(
      "05321112233",
      template,
      expect.anything()
    );
  });

  it("WhatsApp başarısız olduğunda ve fallback açık olduğunda Netgsm SMS'e düşer", async () => {
    process.env.WHATSAPP_TOKEN = "EAAGtesttoken";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123456789";
    process.env.WHATSAPP_ENABLED = "true";
    process.env.WHATSAPP_FALLBACK_TO_SMS = "true";

    // Netgsm config
    process.env.NETGSM_USERCODE = "5321112233";
    process.env.NETGSM_PASSWORD = "secretpassword";
    process.env.NETGSM_MSGHEADER = "ACILCOZUM";

    vi.spyOn(whatsappProvider, "sendWhatsAppText").mockResolvedValue({
      basarili: false,
      saglayici: "whatsapp",
      hata: "131047: 24 saat kuralı aşımı",
    });

    // Mock global fetch for Netgsm XML
    global.fetch = vi.fn().mockResolvedValue({
      text: async () => "00 12345678",
      status: 200,
    });

    const sonuc = await sendSms("05321112233", "Test mesajı", {
      aliciTipi: "musteri",
      kanal: "xml",
    });

    expect(sonuc.basarili).toBe(true);
    expect(sonuc.saglayici).toBe("whatsapp-fallback-sms");
  });

  it("smsDurumu WhatsApp durumunu doğru raporlar", () => {
    process.env.WHATSAPP_TOKEN = "EAAGtesttoken";
    process.env.WHATSAPP_PHONE_NUMBER_ID = "123456789";
    process.env.WHATSAPP_ENABLED = "true";
    delete process.env.NETGSM_USERCODE;
    delete process.env.NETGSM_USERNAME;

    const durum = smsDurumu();
    expect(durum.whatsappAktif).toBe(true);
    expect(durum.saglayici).toBe("whatsapp");
  });
});
