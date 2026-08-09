/**
 * Panel “Hizmet veren duyuruları” — şablon yer tutucuları ve varsayılan gövde.
 */

export const DUYURU_AYARLAR_URL_PH = "{{AYARLAR_URL}}";

export type HizmetVerenDuyuruSablon = {
  id: string;
  etiket: string;
  aciklama: string;
  /** Gönderime hazır (yer tutucular doldurulmuş) */
  mesaj: string;
  /** Ham gövde ({{AYARLAR_URL}} içerebilir) */
  govde: string;
  /** Gönderime hazır SMS parçaları; yoksa null */
  bolumler: string[] | null;
  /** Ham bölümler ({{AYARLAR_URL}} içerebilir) */
  bolumlerHam: string[] | null;
  aktif: boolean;
  sira: number;
};

/** Panel CRUD listesi (DB kaydı) */
export type HizmetVerenDuyuruSablonKayit = {
  id: string;
  etiket: string;
  aciklama: string;
  govde: string;
  bolumler: string[] | null;
  aktif: boolean;
  sira: number;
  olusturulma: string;
  guncelleme: string;
};

export function bildirimPaketiDuyuruGovdeSablon(): string {
  return (
    "acilcozumbul.com: Bildirim paketiniz guncellendi.\n" +
    "1 kredi: Birkac dk icinde SMS\n" +
    "2 kredi: 3 sn icinde hizli SMS\n" +
    "3 kredi: Sesli arama + hizli SMS (onerilen, varsayilan)\n" +
    `Degistirmek icin: ${DUYURU_AYARLAR_URL_PH}`
  );
}

export function duyuruGovdeDoldur(govde: string, ayarlarUrl: string): string {
  const link = ayarlarUrl.replace(/\/$/, "");
  return govde.split(DUYURU_AYARLAR_URL_PH).join(link);
}

/** Doldurulmuş metni tekrar şablon gövdesine çevirir */
export function duyuruGovdeSablonlastir(
  metin: string,
  ayarlarUrl: string
): string {
  const link = ayarlarUrl.replace(/\/$/, "");
  if (!link) return metin;
  return metin.split(link).join(DUYURU_AYARLAR_URL_PH);
}

export function duyuruBolumlerDoldur(
  bolumler: string[] | null | undefined,
  ayarlarUrl: string
): string[] | null {
  if (!bolumler || bolumler.length < 2) return null;
  return bolumler.map((b) => duyuruGovdeDoldur(b, ayarlarUrl));
}

export function duyuruBolumlerSablonlastir(
  bolumler: string[],
  ayarlarUrl: string
): string[] {
  return bolumler.map((b) => duyuruGovdeSablonlastir(b, ayarlarUrl));
}

export function duyuruBolumlerParse(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const liste = raw
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim())
    .filter(Boolean);
  return liste.length >= 2 ? liste : null;
}

/**
 * Aynı numaraya ardışık parçalar arasında bekleme.
 * Hızlı gönderimde operatör/telefon sırayı bozabiliyor (sondan düşme).
 */
export const DUYURU_SMS_PARCA_BEKLEME_MS = 3000;

/** Gönderim sırası: SMS 1 → 2 → 3 (metnin başından) */
export function duyuruSmsParcalariniGonderimSirasi(
  parcalar: string[]
): { metin: string; sira: number }[] {
  return parcalar
    .map((p) => p.trim())
    .filter(Boolean)
    .map((metin, index) => ({ metin, sira: index + 1 }));
}
