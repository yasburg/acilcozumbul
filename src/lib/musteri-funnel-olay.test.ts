import { describe, expect, it } from "vitest";
import {
  MUSTERI_FUNNEL_HUNI_A,
  MUSTERI_FUNNEL_HUNI_ORTAK,
  musteriFunnelOlayHacmiHesapla,
  musteriFunnelOzetHesapla,
  musteriFunnelSessionHuniHesapla,
} from "./musteri-funnel-olay";

describe("musteri-funnel-olay", () => {
  it("session hunisinde talep sonrası OTP sırasını kümülatif sayar", () => {
    const huni = musteriFunnelSessionHuniHesapla(
      [
        { funnel: "a", olay: "goruldu", session_id: "s1" },
        { funnel: "a", olay: "form_adim_konum", session_id: "s1" },
        { funnel: "a", olay: "form_adim_sorun", session_id: "s1" },
        { funnel: "a", olay: "service_selected", session_id: "s1" },
        { funnel: "a", olay: "form_adim_bilgi", session_id: "s1" },
        { funnel: "a", olay: "talep_olustur", session_id: "s1" },
        { funnel: "a", olay: "otp_gonder", session_id: "s1" },
        { funnel: "a", olay: "otp_dogrulandi", session_id: "s1" },
        { funnel: "a", olay: "teklif_secildi", session_id: "s1" },
        { funnel: "b", olay: "goruldu", session_id: "s2" },
        { funnel: "b", olay: "form_adim_sorun", session_id: "s2" },
      ],
      MUSTERI_FUNNEL_HUNI_A
    );

    expect(huni[0]?.adim).toBe("goruldu");
    expect(huni[0]?.sessionSayisi).toBe(2);
    expect(huni.find((a) => a.adim === "talep_olustur")?.sessionSayisi).toBe(1);
    expect(huni.find((a) => a.adim === "otp_gonder")?.sessionSayisi).toBe(1);
    expect(huni.find((a) => a.adim === "teklif_secildi")?.sessionSayisi).toBe(
      1
    );
    // Talep, OTP’den önce
    const talepIdx = huni.findIndex((a) => a.adim === "talep_olustur");
    const otpIdx = huni.findIndex((a) => a.adim === "otp_gonder");
    expect(talepIdx).toBeGreaterThan(-1);
    expect(otpIdx).toBeGreaterThan(talepIdx);
    // s2 hizmete ulaştığı için kümülatif konumda da sayılır
    expect(huni.find((a) => a.adim === "form_adim_konum")?.sessionSayisi).toBe(
      2
    );
    expect(huni.find((a) => a.adim === "form_adim_sorun")?.sessionSayisi).toBe(
      2
    );
    // Monoton: her adım ≤ önceki
    for (let i = 1; i < huni.length; i++) {
      expect(huni[i]!.sessionSayisi).toBeLessThanOrEqual(
        huni[i - 1]!.sessionSayisi
      );
    }
  });

  it("ortak hunide OTP talep sonrasındadır", () => {
    expect(MUSTERI_FUNNEL_HUNI_ORTAK.map((a) => a.id)).toEqual([
      "goruldu",
      "ilk_etkilesim",
      "form_adim_sorun",
      "form_adim_bilgi",
      "talep_olustur",
      "otp_gonder",
      "otp_dogrulandi",
      "teklif_secildi",
    ]);
  });

  it("konum hizmetten fazla olsa bile huniyi şişirmez", () => {
    const huni = musteriFunnelSessionHuniHesapla(
      [
        // s1: sadece konum (A’da ilk adım) — görülme yok
        { funnel: "a", olay: "form_adim_konum", session_id: "s1" },
        // s2: görülme + konum + hizmet
        { funnel: "a", olay: "goruldu", session_id: "s2" },
        { funnel: "a", olay: "form_adim_konum", session_id: "s2" },
        { funnel: "a", olay: "form_adim_sorun", session_id: "s2" },
      ],
      MUSTERI_FUNNEL_HUNI_A
    );

    const goruldu = huni.find((a) => a.adim === "goruldu")!.sessionSayisi;
    const konum = huni.find((a) => a.adim === "form_adim_konum")!.sessionSayisi;
    const hizmet = huni.find((a) => a.adim === "form_adim_sorun")!.sessionSayisi;
    // Kümülatif: konum’a ulaşanlar görülmede de sayılır
    expect(goruldu).toBe(2);
    expect(konum).toBe(2);
    expect(hizmet).toBe(1);
    expect(konum).toBeLessThanOrEqual(goruldu);
    expect(hizmet).toBeLessThanOrEqual(konum);
  });

  it("özet satırlarında OTP oranını talebe göre verir", () => {
    const liste = musteriFunnelOzetHesapla(
      [
        { funnel: "a", olay: "goruldu" },
        { funnel: "a", olay: "goruldu" },
        { funnel: "a", olay: "talep_olustur" },
        { funnel: "a", olay: "otp_gonder" },
        { funnel: "a", olay: "teklif_secildi" },
        { funnel: "b", olay: "goruldu" },
      ],
      [
        { id: "a", etiket: "A", yol: "/a" },
        { id: "b", etiket: "B", yol: "/b" },
      ]
    );
    expect(liste[0]?.goruldu).toBe(2);
    expect(liste[0]?.talep).toBe(1);
    expect(liste[0]?.otpOran).toBe(1);
    expect(liste[0]?.teklifSecildi).toBe(1);
    expect(liste[0]?.teklifOran).toBe(1);
    expect(liste[1]?.goruldu).toBe(1);
    expect(liste[1]?.talep).toBe(0);
    expect(liste[1]?.otpOran).toBeNull();
  });

  it("olay hacmini funnel kırılımıyla verir", () => {
    const hacim = musteriFunnelOlayHacmiHesapla([
      { funnel: "a", olay: "goruldu" },
      { funnel: "a", olay: "goruldu" },
      { funnel: "b", olay: "goruldu" },
      { funnel: "b", olay: "otp_gonder" },
    ]);
    const goruldu = hacim.find((h) => h.olay === "goruldu");
    expect(goruldu?.sayi).toBe(3);
    expect(goruldu?.byFunnel.a).toBe(2);
    expect(goruldu?.byFunnel.b).toBe(1);
  });
});
