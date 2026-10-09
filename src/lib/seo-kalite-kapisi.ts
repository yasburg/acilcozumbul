/**
 * SEO Faz E — kalite kapısı (crawl bütçesi savunması)
 *
 * Amaç: Büyük-5 (`SEO_DERIN_SEHIRLER`) içindeki ince / düşük öncelikli
 * ilçe×hizmet URL’lerini noindex + sitemap dışı bırakmak. Trafik roketi değil.
 *
 * Bu dosya ne YAPMAZ:
 * - GSC otomasyonu / Coverage döngüsü (Faz E ops / gelecek)
 * - Canonical merge veya 301 (ayrı PR)
 * - Sahte LocalBusiness / rating şeması
 * - Rehber (Faz F) sayfalarına dokunmaz
 *
 * Karar özeti → docs/seo-faz-e-kalite-kapisi.md
 */

import {
  seoIlceGetir,
  seoSehirGetir,
} from "@/lib/seo-geo";
import {
  SEO_HIZMET_SLUGS,
  seoHizmetGetir,
  type SeoHizmetSlug,
} from "@/lib/seo-hizmetler";
import {
  ilceHubIcerik,
  ilceHizmetIcerik,
  type SeoLandingIcerik,
} from "@/lib/seo-icerik";
import { seoTalepOlusturYolu, TALEP_OLUSTUR_YOL } from "@/lib/seo-talep";

/** Model A: ilk dalga indexlenebilir hizmetler (yüksek niyet). */
export const SEO_KALITE_ONCELIK_HIZMETLER = [
  "cekici",
  "lastikci",
  "aku-takviye",
] as const satisfies readonly SeoHizmetSlug[];

export type SeoKaliteOncelikHizmet =
  (typeof SEO_KALITE_ONCELIK_HIZMETLER)[number];

/**
 * Model B (muhafazakâr): düşük talep / periferi ilçe slug’ları.
 * İlçe nüfus DB’si yok; manuel proxy. Az sayıda false-positive hedeflenir.
 * Eşik sıkılaştırmak için listeyi genişletin (docs’a bakın).
 */
export const SEO_KALITE_PERIFERI_ILCELER: Readonly<
  Record<string, readonly string[]>
> = {
  istanbul: ["adalar", "sile", "catalca", "silivri"],
  ankara: [
    "evren",
    "gudul",
    "kalecik",
    "nallihan",
    "camlidere",
    "ayas",
    "bala",
    "haymana",
    "sereflikochisar",
  ],
  izmir: ["beydag", "kiraz", "kinik", "karaburun"],
  bursa: ["buyukorhan", "harmancik", "keles", "orhaneli"],
  antalya: ["akseki", "ibradi", "gundogmus", "elmali"],
};

/** İsimler çıkarılınca gövde Jaccard > bu → ince/şablon bayrağı. */
export const SEO_KALITE_BENZERLIK_ESIK = 0.85;

/** Kapsama alanları: zorunlu minimumlar. */
export const SEO_KALITE_MIN_PARAGRAF = 2;
export const SEO_KALITE_MIN_FAQ = 2;

export type SeoKaliteKontrol = {
  kapsamaAlanlari: boolean;
  kapsamaProxy: boolean;
  benzerlikInce: boolean;
  cta: boolean;
};

export type SeoKaliteSonuc = {
  gecer: boolean;
  skor: number;
  ince: boolean;
  uyarilar: string[];
  nedenler: string[];
  kontroller: SeoKaliteKontrol;
};

const ONCELIK_HIZMET_SET = new Set<string>(SEO_KALITE_ONCELIK_HIZMETLER);

/** Şablon iskeleti: ilceHizmetIcerik’ten türetilmiş sabit referans (isim yok). */
const ILCE_HIZMET_SABLON_GOVDE = normalizeMetin(
  [
    "bolgesinde aramalari genelde acil mudahale gerektirir. konumunuzu paylastiginizda yakindaki kayitli hizmet verenler fiyat ve tahmini varis suresi ile teklif gonderebilir.",
    "trafik, saat ve mudahale turu teklifleri etkiler; sabit “x dakikada gelir” iddiasi yayinlamayiz.",
    "ihtiyaciniz icin talep olusturun; gelen tekliflerden size uygun olani secin.",
    "gorunen teklif tutari hizmet verenin onerisidir. anlasma oncesi kosullari netlestirin.",
    "isim, telefon, plaka veya acik adres bu sayfada yoktur; gizlilik korunur.",
  ].join(" ")
);

const ILCE_HUB_SABLON_GOVDE = normalizeMetin(
  [
    "ve cevresinde ariza, lastik, aku veya cekici ihtiyaci sik gorulur.",
    "genelinde oldugu gibi talep ucretsizdir; gelen tekliflerden size uygun olani secersiniz.",
    "konumunuzu paylasmaniz, civarindaki kayitli ekiplerin size teklif gondermesini kolaylastirir.",
    "hizmet veren kimligi public sayfalarda gosterilmez; bilgiler yalnizca seciminizden sonra acilir.",
    "ilce bazinda sabit fiyat listesi yoktur; teklifler anlik musaitlige gore gelir.",
  ].join(" ")
);

function normalizeMetin(raw: string): string {
  return raw
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(metin: string): Set<string> {
  return new Set(metin.split(" ").filter((t) => t.length > 1));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  const birlesim = a.size + b.size - inter;
  return birlesim === 0 ? 0 : inter / birlesim;
}

function isimleriCikar(metin: string, isimler: string[]): string {
  let t = normalizeMetin(metin);
  for (const ad of isimler) {
    const n = normalizeMetin(ad);
    if (!n) continue;
    t = t.split(n).join(" ");
  }
  return t.replace(/\s+/g, " ").trim();
}

function icerikGovde(icerik: SeoLandingIcerik): string {
  return [
    icerik.ozet,
    ...icerik.paragraflar,
    ...icerik.senaryolar,
    icerik.fiyatNotu,
    icerik.guvenNotu,
    ...icerik.faq.map((f) => `${f.soru} ${f.cevap}`),
  ].join(" ");
}

function kapsamaAlanlariOk(icerik: SeoLandingIcerik): {
  ok: boolean;
  nedenler: string[];
} {
  const nedenler: string[] = [];
  if (!icerik.title?.trim()) nedenler.push("title boş");
  if (!icerik.description?.trim()) nedenler.push("description boş");
  if (!icerik.h1?.trim()) nedenler.push("h1 boş");
  if ((icerik.paragraflar?.length ?? 0) < SEO_KALITE_MIN_PARAGRAF) {
    nedenler.push(`paragraf < ${SEO_KALITE_MIN_PARAGRAF}`);
  }
  if ((icerik.faq?.length ?? 0) < SEO_KALITE_MIN_FAQ) {
    nedenler.push(`faq < ${SEO_KALITE_MIN_FAQ}`);
  }
  if (!icerik.ctaEtiket?.trim()) nedenler.push("ctaEtiket boş");
  return { ok: nedenler.length === 0, nedenler };
}

function periferiIlceMi(sehir: string, ilce: string): boolean {
  const liste = SEO_KALITE_PERIFERI_ILCELER[sehir];
  if (!liste) return false;
  return liste.includes(ilce);
}

function oncelikHizmetMi(hizmet: string): boolean {
  return ONCELIK_HIZMET_SET.has(hizmet);
}

function ctaIlceHizmetDogrula(
  sehir: string,
  ilce: string,
  hizmet: string
): { ok: boolean; href: string } {
  const href = seoTalepOlusturYolu({ sehir, ilce, hizmet });
  const ok =
    href.startsWith(`${TALEP_OLUSTUR_YOL}?`) &&
    href.includes(`sehir=${sehir}`) &&
    href.includes("hizmet=");
  return { ok, href };
}

function ctaHubDogrula(
  sehir: string,
  ilce: string
): { ok: boolean; href: string } {
  const href = seoTalepOlusturYolu({ sehir, ilce });
  const ok = href === `/${sehir}/${ilce}`;
  return { ok, href };
}

function skorHesapla(k: SeoKaliteKontrol, ince: boolean): number {
  let s = 0;
  if (k.kapsamaAlanlari) s += 30;
  if (k.kapsamaProxy) s += 35;
  if (k.cta) s += 25;
  if (!ince) s += 10;
  else s += 3; // ince uyarı; şablon içerikte sık
  return s;
}

/**
 * İlçe × hizmet kalite sonucu.
 * `gecer === false` → index/sitemap dışı adayı (yayın katmanı ayrıca derin şehir ister).
 */
export function seoIlceHizmetKaliteSonuc(
  sehir: string,
  ilce: string,
  hizmet: string
): SeoKaliteSonuc {
  const uyarilar: string[] = [];
  const nedenler: string[] = [];

  const sehirKayit = seoSehirGetir(sehir);
  const ilceKayit = seoIlceGetir(sehir, ilce);
  const hizmetKayit = seoHizmetGetir(hizmet);

  if (!sehirKayit || !ilceKayit || !hizmetKayit) {
    return {
      gecer: false,
      skor: 0,
      ince: false,
      uyarilar,
      nedenler: ["geçersiz sehir/ilce/hizmet"],
      kontroller: {
        kapsamaAlanlari: false,
        kapsamaProxy: false,
        benzerlikInce: false,
        cta: false,
      },
    };
  }

  const icerik = ilceHizmetIcerik(
    sehirKayit.ad,
    ilceKayit.ad,
    hizmetKayit
  );
  const alan = kapsamaAlanlariOk(icerik);
  if (!alan.ok) nedenler.push(...alan.nedenler.map((n) => `alan: ${n}`));

  const hizmetOncelik = oncelikHizmetMi(hizmet);
  const periferi = periferiIlceMi(sehir, ilce);
  const kapsamaProxy = hizmetOncelik && !periferi;
  if (!hizmetOncelik) {
    nedenler.push(
      `kapsamaProxy: hizmet '${hizmet}' öncelik listesinde değil`
    );
  }
  if (periferi) {
    nedenler.push(`kapsamaProxy: ilçe '${ilce}' periferi listesinde`);
  }

  const govde = isimleriCikar(icerikGovde(icerik), [
    sehirKayit.ad,
    ilceKayit.ad,
    hizmetKayit.etiket,
    hizmetKayit.etiketUzun,
    "mobil",
  ]);
  const benzerlik = jaccard(tokenSet(govde), tokenSet(ILCE_HIZMET_SABLON_GOVDE));
  const ince = benzerlik >= SEO_KALITE_BENZERLIK_ESIK;
  if (ince) {
    uyarilar.push(
      `benzerlik: şablon oranı ~${benzerlik.toFixed(2)} (≥ ${SEO_KALITE_BENZERLIK_ESIK})`
    );
  }

  const cta = ctaIlceHizmetDogrula(sehir, ilce, hizmet);
  if (!cta.ok) nedenler.push(`cta: geçersiz yol (${cta.href})`);

  /**
   * İnce içerik tek başına fail etmez (şu an tüm sayfalar şablon).
   * Fail: alan / CTA / kapsama proxy. İnce + düşük proxy zaten proxy’den düşer.
   */
  if (ince && !kapsamaProxy) {
    uyarilar.push("ince + düşük kapsama — zaten proxy fail");
  }

  const kontroller: SeoKaliteKontrol = {
    kapsamaAlanlari: alan.ok,
    kapsamaProxy,
    benzerlikInce: ince,
    cta: cta.ok,
  };

  const gecer = alan.ok && kapsamaProxy && cta.ok;

  return {
    gecer,
    skor: skorHesapla(kontroller, ince),
    ince,
    uyarilar,
    nedenler: gecer ? [] : nedenler,
    kontroller,
  };
}

/**
 * İlçe hub kalite sonucu.
 * Muhafazakâr: hub noindex yalnız (1) hub içerik/CTA bozuksa veya
 * (2) derin şehirde TÜM ilçe×hizmet kombinasyonları kapıdan düşüyorsa.
 * Derin olmayan illerde hub her zaman geçer (Faz B koruması).
 */
export function seoIlceHubKaliteSonuc(
  sehir: string,
  ilce: string
): SeoKaliteSonuc {
  const uyarilar: string[] = [];
  const nedenler: string[] = [];

  const sehirKayit = seoSehirGetir(sehir);
  const ilceKayit = seoIlceGetir(sehir, ilce);

  if (!sehirKayit || !ilceKayit) {
    return {
      gecer: false,
      skor: 0,
      ince: false,
      uyarilar,
      nedenler: ["geçersiz sehir/ilce"],
      kontroller: {
        kapsamaAlanlari: false,
        kapsamaProxy: false,
        benzerlikInce: false,
        cta: false,
      },
    };
  }

  const icerik = ilceHubIcerik(sehirKayit.ad, ilceKayit.ad);
  const alan = kapsamaAlanlariOk(icerik);
  if (!alan.ok) nedenler.push(...alan.nedenler.map((n) => `alan: ${n}`));

  const cta = ctaHubDogrula(sehir, ilce);
  if (!cta.ok) nedenler.push(`cta: geçersiz hub yolu (${cta.href})`);

  const govde = isimleriCikar(icerikGovde(icerik), [
    sehirKayit.ad,
    ilceKayit.ad,
  ]);
  const benzerlik = jaccard(tokenSet(govde), tokenSet(ILCE_HUB_SABLON_GOVDE));
  const ince = benzerlik >= SEO_KALITE_BENZERLIK_ESIK;
  if (ince) {
    uyarilar.push(
      `benzerlik: hub şablon oranı ~${benzerlik.toFixed(2)} (≥ ${SEO_KALITE_BENZERLIK_ESIK})`
    );
  }

  const cocukSonuclari = SEO_HIZMET_SLUGS.map((h) =>
    seoIlceHizmetKaliteSonuc(sehir, ilce, h)
  );
  const gecenCocuk = cocukSonuclari.filter((s) => s.gecer).length;
  const tumCocukFail = gecenCocuk === 0;
  const periferi = periferiIlceMi(sehir, ilce);

  /**
   * Derin şehir + tüm çocuklar fail → düşük değer hub (periferi tipik).
   * Diğer illerde çocuklar zaten indexlenmez; hub açık kalır.
   */
  // Periferi map anahtarları = derin şehirler; diğer illerde hub budanmaz.
  const hubBudamaUygula = Object.prototype.hasOwnProperty.call(
    SEO_KALITE_PERIFERI_ILCELER,
    sehir
  );

  let kapsamaProxy = true;
  if (hubBudamaUygula && tumCocukFail) {
    kapsamaProxy = false;
    nedenler.push(
      `kapsamaProxy: tüm ${SEO_HIZMET_SLUGS.length} ilçe×hizmet kapıdan düştü` +
        (periferi ? " (periferi ilçe)" : "")
    );
  } else if (!hubBudamaUygula) {
    uyarilar.push(
      "hub budama yalnız periferi haritası olan (derin) şehirlerde"
    );
  } else if (gecenCocuk > 0) {
    uyarilar.push(`hub korundu: ${gecenCocuk} ilçe×hizmet kapıdan geçti`);
  }

  const kontroller: SeoKaliteKontrol = {
    kapsamaAlanlari: alan.ok,
    kapsamaProxy,
    benzerlikInce: ince,
    cta: cta.ok,
  };

  const gecer = alan.ok && kapsamaProxy && cta.ok;

  return {
    gecer,
    skor: skorHesapla(kontroller, ince),
    ince,
    uyarilar,
    nedenler: gecer ? [] : nedenler,
    kontroller,
  };
}

export function seoKaliteGecerMi(sonuc: SeoKaliteSonuc): boolean {
  return sonuc.gecer;
}

/** Test / rapor: periferi mi? */
export function seoKalitePeriferiIlceMi(sehir: string, ilce: string): boolean {
  return periferiIlceMi(sehir, ilce);
}

/** Test / rapor: öncelik hizmet mi? */
export function seoKaliteOncelikHizmetMi(hizmet: string): boolean {
  return oncelikHizmetMi(hizmet);
}
