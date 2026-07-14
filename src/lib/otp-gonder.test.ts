import { beforeEach, describe, expect, it, vi } from "vitest";

const sendSms = vi.fn();

vi.mock("./sms-provider", () => ({
  sendSms: (...args: unknown[]) => sendSms(...args),
}));

describe("sendOtp → Netgsm OTP SMS", () => {
  beforeEach(() => {
    sendSms.mockReset();
    sendSms.mockResolvedValue({ basarili: true, saglayici: "netgsm-otp" });
  });

  it("kanal=otp ile sendSms çağırır", async () => {
    const { sendOtp } = await import("./otp-gonder");
    const sonuc = await sendOtp("05321234567", "123456", {
      aliciTipi: "musteri",
      talepId: "otp",
      smsMesaj: "acilcozumbul.com dogrulama kodunuz: 123456. 5 dakika gecerlidir.",
    });

    expect(sonuc.basarili).toBe(true);
    expect(sonuc.kanal).toBe("otp_sms");
    expect(sendSms).toHaveBeenCalledWith(
      "05321234567",
      "acilcozumbul.com dogrulama kodunuz: 123456. 5 dakika gecerlidir.",
      expect.objectContaining({
        aliciTipi: "musteri",
        kanal: "otp",
        krediDus: false,
      })
    );
  });

  it("başarısız OTP SMS sonucunu iletir", async () => {
    sendSms.mockResolvedValue({
      basarili: false,
      saglayici: "netgsm-otp",
      hata: "60: OTP paketi yok",
    });
    const { sendOtp } = await import("./otp-gonder");
    const sonuc = await sendOtp("05321234567", "999999", {
      aliciTipi: "cekici",
      smsMesaj: "kod",
    });
    expect(sonuc.basarili).toBe(false);
    expect(sonuc.hata).toContain("60");
  });
});
