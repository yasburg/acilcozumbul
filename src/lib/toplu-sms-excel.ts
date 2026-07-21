import * as XLSX from "xlsx";
import { telefonGecerliMi, telefonNormalize } from "./telefon";

export type TopluSmsAlici = {
  telefon: string;
  ad?: string;
  kaynak: "excel" | "elle";
  hata?: string;
};

const TELEFON_BASLIKLAR = new Set(
  [
    "telefon",
    "tel",
    "phone",
    "gsm",
    "cep",
    "cep telefonu",
    "mobile",
    "numara",
  ].map((s) => s.toLocaleLowerCase("tr"))
);

const AD_BASLIKLAR = new Set(
  ["ad", "isim", "name", "ad soyad", "adsoyad", "müşteri", "musteri"].map((s) =>
    s.toLocaleLowerCase("tr")
  )
);

function baslikEsle(
  headers: string[],
  adaylar: Set<string>
): number {
  for (let i = 0; i < headers.length; i++) {
    const h = String(headers[i] ?? "")
      .trim()
      .toLocaleLowerCase("tr");
    if (adaylar.has(h)) return i;
  }
  return -1;
}

/**
 * Excel / CSV: ilk satır başlık.
 * Zorunlu sütun: telefon | tel | phone | gsm | cep
 * İsteğe bağlı: ad | isim | name
 */
export function exceldenTopluSmsAliciOku(
  buffer: ArrayBuffer
): { alicilar: TopluSmsAlici[]; uyari?: string } {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    return { alicilar: [], uyari: "Excel boş." };
  }
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as (string | number)[][];

  if (rows.length < 2) {
    return {
      alicilar: [],
      uyari: "Başlık + en az bir veri satırı gerekli.",
    };
  }

  const headers = (rows[0] ?? []).map((c) => String(c ?? ""));
  let telIdx = baslikEsle(headers, TELEFON_BASLIKLAR);
  let adIdx = baslikEsle(headers, AD_BASLIKLAR);

  /* Başlık yoksa ilk sütun telefon kabul et */
  if (telIdx < 0) {
    telIdx = 0;
    if (adIdx < 0 && headers.length > 1) adIdx = 1;
  }

  const gorulen = new Set<string>();
  const alicilar: TopluSmsAlici[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const hamTel = String(row[telIdx] ?? "").trim();
    if (!hamTel) continue;
    const ad =
      adIdx >= 0 ? String(row[adIdx] ?? "").trim() || undefined : undefined;
    const telefon = telefonNormalize(hamTel);
    if (!telefonGecerliMi(telefon)) {
      alicilar.push({
        telefon: hamTel,
        ad,
        kaynak: "excel",
        hata: "Geçersiz telefon",
      });
      continue;
    }
    if (gorulen.has(telefon)) continue;
    gorulen.add(telefon);
    alicilar.push({ telefon, ad, kaynak: "excel" });
  }

  return { alicilar };
}

export function elleTelefonEkle(
  ham: string,
  mevcut: TopluSmsAlici[]
): { alici?: TopluSmsAlici; hata?: string } {
  const telefon = telefonNormalize(ham);
  if (!telefonGecerliMi(telefon)) {
    return { hata: "Geçerli bir Türkiye cep numarası girin (05XX…)." };
  }
  if (mevcut.some((a) => a.telefon === telefon && !a.hata)) {
    return { hata: "Bu numara zaten listede." };
  }
  return { alici: { telefon, kaynak: "elle" } };
}
