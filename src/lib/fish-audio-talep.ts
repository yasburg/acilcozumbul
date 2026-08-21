import { aracDurumuGecerliMi } from "./arac-durumu";
import { aracTipiGecerliMi } from "./arac-tipi";
import { kilitDurumuGecerliMi } from "./kilit-durumu";
import { lastikDurumuGecerliMi } from "./lastik-durumu";
import {
  gecerliSorunTipi,
  sorunHedefKonumGerekliMi,
  sorunKilitDurumuGerekliMi,
  sorunLastikDurumuGerekliMi,
  sorunMetniOlustur,
  sorunYakitTipiGerekliMi,
  type SorunTipiId,
} from "./sorun-tipleri";
import { yakitTipiGecerliMi } from "./yakit-tipi";

export type SesliKonum = {
  lat: number;
  lng: number;
  adres: string;
  kaynak: "gps" | "manuel";
};

export type SesliTalepGirdi = {
  sorunTipi?: SorunTipiId;
  sorunDetay?: string;
  lastikDurumu?: string;
  yakitTipi?: string;
  kilitDurumu?: string;
  aracTipi?: string;
  aracDurumu?: string;
  adres?: string;
  hedefAdres?: string;
  hedefBilinmiyor?: boolean;
};

const SORUN_TIPI_ESLEME: Record<string, SorunTipiId> = {
  cekici: "cekici",
  çekici: "cekici",
  kurtarma: "cekici",
  ariza: "ariza",
  arıza: "ariza",
  bozuk: "ariza",
  bozuldu: "ariza",
  "yolda kald": "ariza",
  "yolda kal": "ariza",
  "hareket etmiyor": "ariza",
  "hareket etmiyo": "ariza",
  arızaland: "ariza",
  arizaland: "ariza",
  lastik: "lastik",
  lastiği: "lastik",
  lastigi: "lastik",
  patlak: "lastik",
  patladı: "lastik",
  patladi: "lastik",
  aku: "aku",
  akü: "aku",
  yakit: "yakit",
  yakıt: "yakit",
  benzin: "yakit",
  kaza: "kaza",
  kilit: "kilit",
  anahtar: "kilit",
  "arac-tasima": "arac-tasima",
  tasima: "arac-tasima",
  taşıma: "arac-tasima",
  nakliye: "arac-tasima",
  diger: "diger",
  diğer: "diger",
};

const LASTIK_ESLEME: Record<string, string> = {
  yama: "yama",
  sondü: "yama",
  söndü: "yama",
  patlak: "yama",
  degisim: "degisim",
  değişim: "degisim",
  yarildi: "degisim",
  yarıldı: "degisim",
};

const YAKIT_ESLEME: Record<string, string> = {
  benzin: "benzin",
  dizel: "dizel",
  mazot: "dizel",
  lpg: "lpg",
  elektrik: "elektrik",
  şarj: "elektrik",
  sarj: "elektrik",
};

const KILIT_ESLEME: Record<string, string> = {
  iceride: "iceride",
  içeride: "iceride",
  kayip: "kayip",
  kayıp: "kayip",
  kirik: "kirik",
  kırık: "kirik",
  kumanda: "kumanda",
  kontak: "kontak",
  diger: "diger",
  diğer: "diger",
};

export function metinAl(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  return "";
}

function evetMi(v: unknown): boolean {
  const s = metinAl(v).toLowerCase();
  return s === "true" || s === "1" || s === "evet" || s === "yes";
}

function esle(
  raw: unknown,
  tablo: Record<string, string>,
  gecerli: (id: string) => boolean
): string | undefined {
  const s = metinAl(raw).toLowerCase();
  if (!s) return undefined;
  if (gecerli(s)) return s;
  if (tablo[s]) return tablo[s];
  for (const [anahtar, id] of Object.entries(tablo)) {
    if (s.includes(anahtar)) return id;
  }
  return undefined;
}

export function sorunTipiNormalize(raw: unknown): SorunTipiId | null {
  const s = metinAl(raw).toLocaleLowerCase("tr");
  if (!s) return null;
  if (gecerliSorunTipi(s)) return s;
  if (SORUN_TIPI_ESLEME[s]) return SORUN_TIPI_ESLEME[s];
  const anahtarlar = Object.entries(SORUN_TIPI_ESLEME).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [anahtar, id] of anahtarlar) {
    if (s.includes(anahtar)) return id;
  }
  return null;
}

export function sesliAracParametreleri(
  params: Record<string, unknown>
): SesliTalepGirdi {
  const hedefHam = params.hedef_bilinmiyor;
  return {
    sorunTipi: sorunTipiNormalize(params.sorun_tipi) ?? undefined,
    sorunDetay: metinAl(params.sorun_detay) || undefined,
    lastikDurumu: esle(params.lastik_durumu, LASTIK_ESLEME, lastikDurumuGecerliMi),
    yakitTipi: esle(params.yakit_tipi, YAKIT_ESLEME, yakitTipiGecerliMi),
    kilitDurumu: esle(params.kilit_durumu, KILIT_ESLEME, kilitDurumuGecerliMi),
    aracTipi: metinAl(params.arac_tipi) || undefined,
    aracDurumu: metinAl(params.arac_durumu) || undefined,
    adres: metinAl(params.adres) || undefined,
    hedefAdres: metinAl(params.hedef_adres) || undefined,
    hedefBilinmiyor:
      hedefHam === undefined || hedefHam === null || hedefHam === ""
        ? undefined
        : evetMi(hedefHam),
  };
}

export function sesliOzetBirlestir(
  onceki: SesliTalepGirdi,
  gelen: SesliTalepGirdi
): SesliTalepGirdi {
  return {
    sorunTipi: gelen.sorunTipi ?? onceki.sorunTipi,
    sorunDetay: gelen.sorunDetay || onceki.sorunDetay,
    lastikDurumu: gelen.lastikDurumu || onceki.lastikDurumu,
    yakitTipi: gelen.yakitTipi || onceki.yakitTipi,
    kilitDurumu: gelen.kilitDurumu || onceki.kilitDurumu,
    aracTipi: gelen.aracTipi || onceki.aracTipi,
    aracDurumu: gelen.aracDurumu || onceki.aracDurumu,
    adres: gelen.adres || onceki.adres,
    hedefAdres: gelen.hedefAdres || onceki.hedefAdres,
    hedefBilinmiyor: gelen.hedefBilinmiyor ?? onceki.hedefBilinmiyor,
  };
}

export function sesliTalepDogrula(
  girdi: SesliTalepGirdi,
  konum: SesliKonum | null
): string | null {
  const tip = girdi.sorunTipi;
  if (!tip || !gecerliSorunTipi(tip)) return "Geçerli bir sorun tipi gerekli.";
  if (tip === "diger" && !girdi.sorunDetay) {
    return "Sorunu kısaca açıklayın.";
  }
  if (sorunLastikDurumuGerekliMi(tip) && !lastikDurumuGecerliMi(girdi.lastikDurumu ?? "")) {
    return "Lastik durumunu netleştirin: yama veya değişim.";
  }
  if (sorunYakitTipiGerekliMi(tip) && !yakitTipiGecerliMi(girdi.yakitTipi ?? "")) {
    return "Yakıt tipini netleştirin.";
  }
  if (sorunKilitDurumuGerekliMi(tip) && !kilitDurumuGecerliMi(girdi.kilitDurumu ?? "")) {
    return "Kilit durumunu netleştirin.";
  }
  const adres = konum?.adres?.trim() || girdi.adres?.trim() || "";
  if (!adres) return "Konum gerekli.";
  if (
    sorunHedefKonumGerekliMi(tip) &&
    !girdi.hedefBilinmiyor &&
    !girdi.hedefAdres?.trim()
  ) {
    return "Hedef adres yoksa hedef_bilinmiyor=true gönderin.";
  }
  return null;
}

export function sesliTalepGovde(
  girdi: SesliTalepGirdi,
  konum: SesliKonum
): Record<string, unknown> {
  const tip = girdi.sorunTipi ?? "diger";
  const sorunDetay = girdi.sorunDetay?.trim() || undefined;
  const hedefGerekli = sorunHedefKonumGerekliMi(tip) && !girdi.hedefBilinmiyor;
  return {
    konum: {
      lat: konum.lat,
      lng: konum.lng,
      adres: konum.adres,
      kaynak: konum.kaynak,
    },
    ...(girdi.hedefBilinmiyor ? { hedefBilinmiyor: true } : {}),
    ...(hedefGerekli && girdi.hedefAdres
      ? {
          hedefKonum: {
            lat: 0,
            lng: 0,
            adres: girdi.hedefAdres,
          },
        }
      : {}),
    sorunTipi: tip,
    sorunDetay,
    sorun: sorunMetniOlustur(tip, sorunDetay),
    lastikDurumu: lastikDurumuGecerliMi(girdi.lastikDurumu ?? "")
      ? girdi.lastikDurumu
      : undefined,
    yakitTipi: yakitTipiGecerliMi(girdi.yakitTipi ?? "")
      ? girdi.yakitTipi
      : undefined,
    kilitDurumu: kilitDurumuGecerliMi(girdi.kilitDurumu ?? "")
      ? girdi.kilitDurumu
      : undefined,
    aracTipi: aracTipiGecerliMi(girdi.aracTipi ?? "")
      ? girdi.aracTipi
      : undefined,
    aracDurumu: aracDurumuGecerliMi(girdi.aracDurumu ?? "")
      ? girdi.aracDurumu
      : undefined,
  };
}
