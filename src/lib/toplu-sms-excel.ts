import * as XLSX from "xlsx";
import {
  telefonGecerliMi,
  telefonNormalize,
  telefonSabitHatMi,
} from "./telefon";

export type TopluSmsAlici = {
  telefon: string;
  ad?: string;
  kaynak: "excel" | "elle";
  hata?: string;
};

export type ExcelYukleOzet = {
  satirOkunan: number;
  gecerli: number;
  gecersiz: number;
  sabitHatAtlandi: number;
  tekrarAtlandi: number;
  listeyeEklenen: number;
  zatenListede: number;
};

const TELEFON_BASLIKLAR = new Set(
  [
    "telefon",
    "tel",
    "phone",
    "phone_number",
    "phone number",
    "phonenumber",
    "gsm",
    "cep",
    "cep telefonu",
    "telefon numarası",
    "telefon numarasi",
    "mobile",
    "numara",
  ].map((s) => s.toLocaleLowerCase("tr"))
);

const AD_BASLIKLAR = new Set(
  [
    "ad",
    "isim",
    "name",
    "full_name",
    "full name",
    "fullname",
    "ad soyad",
    "adsoyad",
    "müşteri",
    "musteri",
  ].map((s) => s.toLocaleLowerCase("tr"))
);

export const TOPLU_SMS_SABLON_DOSYA = "acilcozumbul-toplu-sms-sablon.xlsx";

function baslikEsle(headers: string[], adaylar: Set<string>): number {
  for (let i = 0; i < headers.length; i++) {
    const h = String(headers[i] ?? "")
      .trim()
      .toLocaleLowerCase("tr")
      .replace(/[_]+/g, " ")
      .replace(/\s+/g, " ");
    if (adaylar.has(h)) return i;
    /* phone_number → phone number zaten; birleşik de dene */
    const birlesik = h.replace(/\s+/g, "");
    if (adaylar.has(birlesik)) return i;
  }
  return -1;
}

/** İndirilebilir Excel şablonu (telefon + ad + örnek satırlar) */
export function topluSmsExcelSablonBlob(): Blob {
  const ws = XLSX.utils.aoa_to_sheet([
    ["telefon", "ad"],
    ["05321234567", "Örnek Kişi"],
    ["05329876543", ""],
  ]);
  ws["!cols"] = [{ wch: 14 }, { wch: 20 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Alicilar");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function topluSmsExcelSablonIndir(): void {
  const blob = topluSmsExcelSablonBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = TOPLU_SMS_SABLON_DOSYA;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Excel / CSV: ilk satır başlık.
 * Zorunlu sütun: telefon | phone_number | tel | phone | gsm | cep …
 * İsteğe bağlı: ad | full_name | isim | name
 * Meta lead export (`phone_number`, `full_name`, `p:+90…`) desteklenir.
 *
 * Sabit hatlar ve dosya içi tekrarlar listeye alınmaz.
 */
export function exceldenTopluSmsAliciOku(buffer: ArrayBuffer): {
  alicilar: TopluSmsAlici[];
  ozet: Omit<ExcelYukleOzet, "listeyeEklenen" | "zatenListede">;
  uyari?: string;
} {
  const bosOzet = {
    satirOkunan: 0,
    gecerli: 0,
    gecersiz: 0,
    sabitHatAtlandi: 0,
    tekrarAtlandi: 0,
  };

  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    return { alicilar: [], ozet: bosOzet, uyari: "Excel boş." };
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
      ozet: bosOzet,
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
  let satirOkunan = 0;
  let gecerli = 0;
  let gecersiz = 0;
  let sabitHatAtlandi = 0;
  let tekrarAtlandi = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const hamTel = String(row[telIdx] ?? "").trim();
    if (!hamTel) continue;
    satirOkunan += 1;
    const ad =
      adIdx >= 0 ? String(row[adIdx] ?? "").trim() || undefined : undefined;

    if (telefonSabitHatMi(hamTel)) {
      sabitHatAtlandi += 1;
      continue;
    }

    const telefon = telefonNormalize(hamTel);
    if (!telefonGecerliMi(telefon)) {
      gecersiz += 1;
      /* Listeye ekleme — SMS’e gitmez; özet sayılır */
      continue;
    }
    if (gorulen.has(telefon)) {
      tekrarAtlandi += 1;
      continue;
    }
    gorulen.add(telefon);
    gecerli += 1;
    alicilar.push({ telefon, ad, kaynak: "excel" });
  }

  return {
    alicilar,
    ozet: {
      satirOkunan,
      gecerli,
      gecersiz,
      sabitHatAtlandi,
      tekrarAtlandi,
    },
  };
}

/** Dosyadan okunanları mevcut listeye birleştir; özet döner */
export function excelAlicilariListeyeEkle(
  mevcut: TopluSmsAlici[],
  yeni: TopluSmsAlici[],
  dosyaOzet: Omit<ExcelYukleOzet, "listeyeEklenen" | "zatenListede">
): { alicilar: TopluSmsAlici[]; ozet: ExcelYukleOzet } {
  const map = new Map<string, TopluSmsAlici>();
  for (const a of mevcut) {
    if (!a.hata) map.set(a.telefon, a);
  }

  let listeyeEklenen = 0;
  let zatenListede = 0;
  for (const a of yeni) {
    if (a.hata) continue;
    if (map.has(a.telefon)) {
      zatenListede += 1;
      continue;
    }
    map.set(a.telefon, a);
    listeyeEklenen += 1;
  }

  /* Hatalı satırlar Excel’den artık gelmiyor; elle hatalıları koru */
  const hatalilar = mevcut.filter((a) => a.hata);

  return {
    alicilar: [...map.values(), ...hatalilar],
    ozet: {
      ...dosyaOzet,
      listeyeEklenen,
      zatenListede,
    },
  };
}

export function elleTelefonEkle(
  ham: string,
  mevcut: TopluSmsAlici[]
): { alici?: TopluSmsAlici; hata?: string } {
  if (telefonSabitHatMi(ham)) {
    return { hata: "Sabit hat numaralarına SMS gönderilmez." };
  }
  const telefon = telefonNormalize(ham);
  if (!telefonGecerliMi(telefon)) {
    return { hata: "Geçerli bir Türkiye cep numarası girin (05XX…)." };
  }
  if (mevcut.some((a) => a.telefon === telefon && !a.hata)) {
    return { hata: "Bu numara zaten listede." };
  }
  return { alici: { telefon, kaynak: "elle" } };
}
