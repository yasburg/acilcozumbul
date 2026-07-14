import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendSms = vi.fn();
const addSmsKaydi = vi.fn();

vi.mock("./sms-provider", () => ({
  sendSms: (...args: unknown[]) => sendSms(...args),
}));

vi.mock("./db", () => ({
  addSmsKaydi: (...args: unknown[]) => addSmsKaydi(...args),
}));

describe("sendOtp WhatsApp", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    sendSms.mockReset();
    addSmsKaydi.mockReset().mockResolvedValue(undefined);
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    process.env.NETGSM_USERCODE = "8501234567";
    process.env.NETGSM_PASSWORD = "secret";
    delete process.env.NETGSM_USERNAME;
    delete process.env.OTP_KANAL;
    delete process.env.OTP_SMS_FALLBACK;
    delete process.env.NETGSM_WHATSAPP_OTP_URL;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NETGSM_USERCODE;
    delete process.env.NETGSM_PASSWORD;
  });

  it("WhatsApp başarılıysa SMS çağırmaz", async () => {
    fetchMock.mockResolvedValue({
      text: async () =>
        JSON.stringify({ code: "00", description: "success", jobid: "wamid.x" }),
    });

    const { sendOtp } = await import("./otp-gonder");
    const sonuc = await sendOtp("05321234567", "123456", {
      aliciTipi: "musteri",
      talepId: "otp",
      smsMesaj: "yedek mesaj",
    });

    expect(sonuc.basarili).toBe(true);
    expect(sonuc.kanal).toBe("whatsapp");
    expect(sendSms).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://whatsappapi.netgsm.com.tr/v1/otp",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ to: "+905321234567", code: "123456" }),
      })
    );
  });

  it("WhatsApp başarısızsa SMS yedeğe düşer", async () => {
    fetchMock.mockResolvedValue({
      text: async () =>
        JSON.stringify({ code: "60", description: "no package" }),
    });
    sendSms.mockResolvedValue({ basarili: true, saglayici: "netgsm" });

    const { sendOtp } = await import("./otp-gonder");
    const sonuc = await sendOtp("05321234567", "654321", {
      aliciTipi: "musteri",
      smsMesaj: "acilcozumbul.com kod: 654321",
    });

    expect(sonuc.basarili).toBe(true);
    expect(sonuc.kanal).toBe("sms");
    expect(sendSms).toHaveBeenCalledTimes(1);
  });

  it("OTP_KANAL=sms ile doğrudan SMS", async () => {
    process.env.OTP_KANAL = "sms";
    sendSms.mockResolvedValue({ basarili: true, saglayici: "netgsm" });

    const { sendOtp } = await import("./otp-gonder");
    const sonuc = await sendOtp("05321234567", "111111", {
      aliciTipi: "cekici",
      smsMesaj: "kod",
    });

    expect(sonuc.kanal).toBe("sms");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sendSms).toHaveBeenCalled();
  });

  it("OTP_SMS_FALLBACK=0 iken WhatsApp hatasında SMS yok", async () => {
    process.env.OTP_SMS_FALLBACK = "0";
    fetchMock.mockResolvedValue({
      text: async () => JSON.stringify({ code: "60", description: "no pkg" }),
    });

    const { sendOtp } = await import("./otp-gonder");
    const sonuc = await sendOtp("05321234567", "222222", {
      aliciTipi: "musteri",
      smsMesaj: "kod",
    });

    expect(sonuc.basarili).toBe(false);
    expect(sonuc.kanal).toBe("whatsapp");
    expect(sendSms).not.toHaveBeenCalled();
  });
});
