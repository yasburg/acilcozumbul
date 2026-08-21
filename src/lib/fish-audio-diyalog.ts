import { TURKIYE_IL_NUFUS } from "./turkiye-il-nufus";
import { sesliOzetAlanlari, sesliOzetHazirMi } from "./fish-audio-ozet";
import { sorunHedefKonumGerekliMi } from "./sorun-tipleri";
import {
  sesliAracParametreleri,
  sesliOzetBirlestir,
  type SesliKonum,
  type SesliTalepGirdi,
} from "./fish-audio-talep";

const ARAC_DURUM_KELIME: Record<string, string> = {
  "çalışmıyor ama boşa": "calismiyor_bosa_aliniyor",
  "calismiyor ama bosa": "calismiyor_bosa_aliniyor",
  "boşa alınmıyor": "calismiyor_bosa_alinamiyor",
  "bosa alinmiyor": "calismiyor_bosa_alinamiyor",
  "hareket etmiyor": "calismiyor_bosa_aliniyor",
  "hareket etmiyo": "calismiyor_bosa_aliniyor",
  "çalışmıyor": "calismiyor_bosa_aliniyor",
  calismiyor: "calismiyor_bosa_aliniyor",
  çalışıyor: "calisiyor",
  calisiyor: "calisiyor",
};

const ARAC_TIP_KELIME: Record<string, string> = {
  sedan: "sedan",
  hatchback: "hatchback",
  suv: "suv",
  jeep: "suv",
  station: "station",
  coupe: "coupe",
  minivan: "minivan",
  pickup: "pickup",
  motosiklet: "motosiklet",
  motor: "motosiklet",
};

const YER_REGEX =
  /cadde|sokak|bulvar|mahalle|km\b|otoyol|köprü|kopru|e-?\s*5|tem\b|çıkış|cikis|'deyim|'teyim|halkalı|halkali/i;

function kucuk(s: string): string {
  return s.trim().toLocaleLowerCase("tr");
}

function ilBul(metin: string): string | undefined {
  const t = kucuk(metin);
  const iller = Object.keys(TURKIYE_IL_NUFUS).sort((a, b) => b.length - a.length);
  for (const il of iller) {
    if (t.includes(kucuk(il))) return il;
  }
  return undefined;
}

function aracDurumuBul(metin: string): string | undefined {
  const t = kucuk(metin);
  for (const [kelime, id] of Object.entries(ARAC_DURUM_KELIME)) {
    if (t.includes(kelime)) return id;
  }
  return undefined;
}

function aracTipiBul(metin: string): string | undefined {
  const t = kucuk(metin);
  for (const [kelime, id] of Object.entries(ARAC_TIP_KELIME)) {
    if (t.includes(kelime)) return id;
  }
  return undefined;
}

function adresCumlesiTemizle(c: string): string {
  return c
    .trim()
    .replace(/^(merhaba|selamünaleyküm|selamunaleykum|selam|alo)[,.\s]*/i, "")
    .replace(/['']n[dt][ae]y[iı]m$/i, "")
    .replace(/[''][dt][ae]y[iı]m$/i, "")
    .replace(/[ıiuü]?n[dt][ae]y[iı]m$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function adresAyikla(metin: string): string | undefined {
  const parcalar: string[] = [];
  for (const ham of metin.split(/[.!?,;]+/)) {
    const temiz = adresCumlesiTemizle(ham);
    if (temiz.length < 3) continue;
    if (ilBul(temiz) || YER_REGEX.test(temiz)) parcalar.push(temiz);
  }
  if (parcalar.length === 0) return undefined;
  return parcalar.join(", ");
}

export function sesliMetindenGirdi(
  metin: string,
  _onceki: SesliTalepGirdi
): SesliTalepGirdi {
  const ham = metin.trim();
  if (!ham) return {};
  const gelen = sesliAracParametreleri({
    sorun_tipi: ham,
    lastik_durumu: ham,
    yakit_tipi: ham,
    kilit_durumu: ham,
    hedef_bilinmiyor: /bilmiyorum|bilmiyom|sonra\s+(seç|sec|söyler)/i.test(ham)
      ? "true"
      : "",
  });
  const aracDurumu = aracDurumuBul(ham);
  const aracTipi = aracTipiBul(ham);
  const adres = adresAyikla(ham);
  const hedefBilinmiyor =
    gelen.hedefBilinmiyor === true ||
    (Boolean(gelen.sorunTipi) &&
      sorunHedefKonumGerekliMi(gelen.sorunTipi) &&
      !gelen.hedefAdres);
  return {
    ...gelen,
    sorunDetay: gelen.sorunTipi === "diger" ? ham : undefined,
    ...(aracDurumu ? { aracDurumu } : {}),
    ...(aracTipi ? { aracTipi } : {}),
    ...(adres ? { adres } : {}),
    ...(hedefBilinmiyor ? { hedefBilinmiyor: true } : {}),
  };
}

function sonrakiSoru(girdi: SesliTalepGirdi, konum: SesliKonum | null): string {
  const ilkEksik = sesliOzetAlanlari(girdi, konum).find(
    (a) => a.zorunlu && !a.tamam
  );
  switch (ilkEksik?.id) {
    case "konum":
      return "Şu an neredesiniz? Şehir ve cadde yeterli.";
    case "sorun_tipi":
      return "Lastik, akü, yakıt, kaza, kilit veya çekici — hangisi?";
    case "sorun_detay":
      return "Kısaca ne olduğunu söyler misiniz?";
    case "lastik_durumu":
      return "Lastik yama mı lazım, yoksa değişim mi?";
    case "yakit_tipi":
      return "Benzin, dizel, LPG mi, elektrik mi?";
    case "kilit_durumu":
      return "Anahtar içeride mi, kayıp mı, yoksa kilit başka türlü mü açılmıyor?";
    case "hedef":
      return "Aracı nereye çekelim? Bilmiyorsanız bilmiyorum deyin.";
    default:
      return "Başka acil bir şey var mı?";
  }
}

export function sesliDiyalogTuru(opts: {
  metin: string;
  girdi: SesliTalepGirdi;
  konum: SesliKonum | null;
}): { yanit: string; girdi: SesliTalepGirdi; hazir: boolean } {
  const gelen = sesliMetindenGirdi(opts.metin, opts.girdi);
  const girdi = sesliOzetBirlestir(opts.girdi, gelen);
  const hazir = sesliOzetHazirMi(girdi, opts.konum);
  if (hazir) {
    return {
      yanit: "Tamam, yakındaki ekiplere iletiyorum. Teklifler birazdan gelir.",
      girdi,
      hazir: true,
    };
  }
  return {
    yanit: sonrakiSoru(girdi, opts.konum),
    girdi,
    hazir: false,
  };
}
