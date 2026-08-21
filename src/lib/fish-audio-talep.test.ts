import { describe, expect, it } from "vitest";
import { sesliOzetAlanlari, sesliOzetHazirMi } from "./fish-audio-ozet";
import {
  sesliAracParametreleri,
  sesliOzetBirlestir,
  sesliTalepDogrula,
  sesliTalepGovde,
  sorunTipiNormalize,
  type SesliKonum,
} from "./fish-audio-talep";
import { sesliDiyalogTuru, sesliMetindenGirdi } from "./fish-audio-diyalog";
import { FISH_AUDIO_TTS_MODEL_DEFAULT } from "./fish-audio";

const KONUM: SesliKonum = {
  lat: 41.01,
  lng: 29.0,
  adres: "Kadıköy, İstanbul",
  kaynak: "gps",
};

describe("fish-audio talep", () => {
  it("varsayılan TTS modeli s2.1-pro-free", () => {
    expect(FISH_AUDIO_TTS_MODEL_DEFAULT).toBe("s2.1-pro-free");
  });

  it("Türkçe sorun ifadesini tipe çevirir", () => {
    expect(sorunTipiNormalize("lastik patladı")).toBe("lastik");
    expect(sorunTipiNormalize("lastiği patladı")).toBe("lastik");
    expect(sorunTipiNormalize("çekici")).toBe("cekici");
    expect(sorunTipiNormalize("akü bitti")).toBe("aku");
  });

  it("lastik yama eşlemesi", () => {
    const g = sesliAracParametreleri({
      sorun_tipi: "lastik",
      lastik_durumu: "patlak",
    });
    expect(g.lastikDurumu).toBe("yama");
  });

  it("özet birleştirme boş alanı silmez", () => {
    const birlesik = sesliOzetBirlestir(
      { sorunTipi: "lastik", lastikDurumu: "yama" },
      { sorunDetay: "ön sağ" }
    );
    expect(birlesik.sorunTipi).toBe("lastik");
    expect(birlesik.lastikDurumu).toBe("yama");
    expect(birlesik.sorunDetay).toBe("ön sağ");
  });

  it("lastik talebi lastik durumu olmadan hazır değil", () => {
    const girdi = { sorunTipi: "lastik" as const };
    expect(sesliTalepDogrula(girdi, KONUM)).toMatch(/Lastik/);
    expect(sesliOzetHazirMi(girdi, KONUM)).toBe(false);
  });

  it("lastik + konum + yama hazır sayılır", () => {
    const girdi = { sorunTipi: "lastik" as const, lastikDurumu: "yama" };
    expect(sesliTalepDogrula(girdi, KONUM)).toBeNull();
    expect(sesliOzetHazirMi(girdi, KONUM)).toBe(true);
    const alanlar = sesliOzetAlanlari(girdi, KONUM);
    expect(alanlar.find((a) => a.id === "lastik_durumu")?.tamam).toBe(true);
  });

  it("çekici hedefi bilinmiyor ise hazır", () => {
    const girdi = {
      sorunTipi: "cekici" as const,
      hedefBilinmiyor: true,
    };
    expect(sesliTalepDogrula(girdi, KONUM)).toBeNull();
    const govde = sesliTalepGovde(girdi, KONUM);
    expect(govde.hedefBilinmiyor).toBe(true);
    expect(govde.sorunTipi).toBe("cekici");
  });
});

describe("fish-audio diyalog", () => {
  it("konum yoksa şehir sorar", () => {
    const r = sesliDiyalogTuru({
      metin: "lastik patladı",
      girdi: {},
      konum: null,
    });
    expect(r.girdi.sorunTipi).toBe("lastik");
    expect(r.hazir).toBe(false);
    expect(r.yanit).toMatch(/nered/i);
  });

  it("konum + lastik yama ile talebi kapatır", () => {
    const r = sesliDiyalogTuru({
      metin: "lastik patlak, yama yeter",
      girdi: {},
      konum: KONUM,
    });
    expect(r.girdi.sorunTipi).toBe("lastik");
    expect(r.girdi.lastikDurumu).toBe("yama");
    expect(r.hazir).toBe(true);
    expect(r.yanit).toMatch(/ekiplere/i);
  });

  it("il adından adres çıkarır", () => {
    const g = sesliMetindenGirdi("İstanbul Kadıköy Bağdat Caddesi", {});
    expect(g.adres).toMatch(/Kadıköy/i);
  });

  it("E-5 çıkışını konum sayar, selamı saymaz", () => {
    const yer = sesliMetindenGirdi("İstanbul'dayım. E-5 Halkalı çıkışındayım.", {});
    expect(yer.adres).toMatch(/Halkalı/i);
    expect(yer.adres).not.toMatch(/Sesim/i);
    const selam = sesliMetindenGirdi("Sesim geliyor mu?", {});
    expect(selam.adres).toBeUndefined();
    expect(selam.sorunTipi).toBeUndefined();
  });

  it("yolda kaldı cümlesinden arıza ve temiz adres çıkarır", () => {
    const r = sesliDiyalogTuru({
      metin:
        "Merhaba, İstanbul Bayrampaşa Yıldırım Mahallesi'ndeyim. Aracım yolda kaldı, hareket etmiyor.",
      girdi: {},
      konum: null,
    });
    expect(r.girdi.sorunTipi).toBe("ariza");
    expect(r.girdi.adres).toMatch(/Bayrampaşa/i);
    expect(r.girdi.adres).not.toMatch(/Merhaba/i);
    expect(r.girdi.adres).not.toMatch(/hareket/i);
    expect(r.girdi.hedefBilinmiyor).toBe(true);
    expect(r.hazir).toBe(true);
  });
});
