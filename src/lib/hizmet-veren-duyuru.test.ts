import { describe, expect, it } from "vitest";
import {
  bildirimPaketiDuyuruGovdeSablon,
  DUYURU_AYARLAR_URL_PH,
  duyuruBolumlerDoldur,
  duyuruBolumlerSablonlastir,
  duyuruGovdeDoldur,
  duyuruGovdeSablonlastir,
  duyuruSmsParcalariniGonderimSirasi,
} from "./hizmet-veren-duyuru";

describe("hizmet veren duyuru", () => {
  const ayarlarUrl =
    "https://www.acilcozumbul.com/cekici/panel?tab=ayarlar";

  it("bildirim paketi şablonu 3 seviyeyi içerir", () => {
    const govde = bildirimPaketiDuyuruGovdeSablon();
    expect(govde).toContain(DUYURU_AYARLAR_URL_PH);
    const mesaj = duyuruGovdeDoldur(govde, ayarlarUrl);
    expect(mesaj).toContain("1 kredi");
    expect(mesaj).toContain("2 kredi");
    expect(mesaj).toContain("3 kredi");
    expect(mesaj).toContain("Sesli arama");
    expect(mesaj).toContain("ayarlar");
    expect(mesaj).not.toContain(DUYURU_AYARLAR_URL_PH);
  });

  it("bölüm kesimleri doldurulup şablonlaştırılır", () => {
    const ham = [
      `acilcozumbul.com: test\n`,
      `Degistirmek icin: ${DUYURU_AYARLAR_URL_PH}`,
    ];
    const dolu = duyuruBolumlerDoldur(ham, ayarlarUrl);
    expect(dolu).toHaveLength(2);
    expect(dolu![1]).toContain(ayarlarUrl);
    expect(dolu![1]).not.toContain(DUYURU_AYARLAR_URL_PH);
    const geri = duyuruBolumlerSablonlastir(dolu!, ayarlarUrl);
    expect(geri[1]).toContain(DUYURU_AYARLAR_URL_PH);
    expect(duyuruGovdeSablonlastir(dolu!.join(""), ayarlarUrl)).toContain(
      DUYURU_AYARLAR_URL_PH
    );
  });

  it("gönderim sırası baştan (SMS 1 önce)", () => {
    const sirali = duyuruSmsParcalariniGonderimSirasi(["bir", "iki", "uc"]);
    expect(sirali.map((x) => x.metin)).toEqual(["bir", "iki", "uc"]);
    expect(sirali.map((x) => x.sira)).toEqual([1, 2, 3]);
  });
});
