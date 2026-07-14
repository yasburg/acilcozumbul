import type { Metadata } from "next";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { YASAL_SIRKET } from "@/lib/yasal-sirket";

export const SITE_URL = smsBaseUrl();

export const SITE_ADI = YASAL_SIRKET.platformAdi;
export const SITE_DOMAIN = YASAL_SIRKET.platformDomain;

/** Ana anahtar ifadeler — Google + AI cevap kutuları */
export const SEO_ANAHTARLAR = [
  "çekici",
  "acil çekici",
  "yol yardım",
  "lastikçi",
  "anahtarcı",
  "araç çekici",
  "yolda kaldım",
  "çekici çağır",
  "acil yol yardım",
  "acilcozumbul",
] as const;

export const SEO_ACIKLAMA =
  "Yolda mı kaldınız? Acil Çözüm Bul ile yakınınızdaki çekici, lastikçi ve anahtarcılardan dakikalar içinde teklif alın. Kayıt ücretsiz; fiyatı siz seçin.";

export const SEO_BASLIK = `${SITE_ADI} | Acil Çekici, Lastikçi ve Yol Yardım`;

export const CEKICI_KAYIT_SEO = {
  title: "Çekici, Lastikçi, Anahtarcı Kaydı | Ücretsiz Teklif Verin",
  description:
    "Çekici, lastikçi veya anahtarcı mısınız? Bölgenizdeki yol yardım taleplerine ücretsiz teklif verin. Kayıt ücretsiz; müşteri sizi seçince telefon ve konum açılır.",
} as const;

export const CEKICI_GIRIS_SEO = {
  title: "Hizmet Veren Girişi",
  description:
    "Acil Çözüm Bul çekici, lastikçi ve anahtarcı paneline giriş yapın. Talepleri görün, teklif verin.",
} as const;

/** Sık sorulan sorular — görünür içerik + FAQPage şeması (AI SEO) */
export const SSS_MADDELERI = [
  {
    soru: "Acil Çözüm Bul nedir?",
    cevap:
      "Acil Çözüm Bul (acilcozumbul.com), Türkiye'de yolda kalan sürücüleri yakındaki çekici, lastikçi, anahtarcı ve yol yardım hizmet verenleriyle buluşturan bir platformdur. Müşteri talep açar; hizmet verenler fiyat ve süre teklifi gönderir; müşteri birini seçer.",
  },
  {
    soru: "Nasıl çekici veya yol yardım çağırırım?",
    cevap:
      "Ana sayfada sorun tipinizi seçin (çekici, lastik, akü, kilit vb.), telefonunuzu doğrulayın, konumunuzu paylaşın. Yakındaki hizmet verenlere bildirim gider; gelen tekliflerden size uygun olanı seçersiniz.",
  },
  {
    soru: "Hizmet veren kaydı ve teklif vermek ücretli mi?",
    cevap:
      "Kayıt ücretsizdir. Teklif vermek ücretsizdir. Hizmet verenler bölge taleplerinden SMS ve panel bildirimi almak için kredi kullanır; kazanç, müşteriyle anlaştıkları teklif tutarıdır.",
  },
  {
    soru: "Hangi şehirlerde hizmet veriyorsunuz?",
    cevap:
      "Platform il ve ilçe bazlı çalışır. Desteklenen illerde kayıtlı çekici, lastikçi ve anahtarcılar taleplere bölge tercihlerine göre yanıt verir.",
  },
] as const;

export function sayfaUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function sayfaMetadata(opts: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  /** true ise title.template uygulanmaz (ana sayfa için) */
  absoluteTitle?: boolean;
}): Metadata {
  const url = sayfaUrl(opts.path ?? "/");
  return {
    title: opts.absoluteTitle
      ? { absolute: opts.title }
      : opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_ADI,
      locale: "tr_TR",
      type: "website",
      images: [
        {
          url: sayfaUrl("/acilcozumbul-logo-yazili.png"),
          alt: `${SITE_ADI} logo`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: opts.title,
      description: opts.description,
      images: [sayfaUrl("/acilcozumbul-logo-yazili.png")],
    },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_ADI,
    alternateName: ["acilcozumbul", "AcilCozumBul"],
    url: SITE_URL,
    logo: sayfaUrl("/acilcozumbul-logo-transparan.png"),
    email: YASAL_SIRKET.eposta,
    foundingLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "İstanbul",
        addressCountry: "TR",
      },
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Yıldırım Mah. Bosna Sk. No:13 İç Kapı:4",
      addressLocality: "Bayrampaşa",
      addressRegion: "İstanbul",
      addressCountry: "TR",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: YASAL_SIRKET.eposta,
      contactType: "customer support",
      availableLanguage: ["Turkish"],
    },
    areaServed: { "@type": "Country", name: "Türkiye" },
    knowsAbout: [
      "çekici",
      "yol yardım",
      "lastikçi",
      "anahtarcı",
      "araç çekme",
    ],
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_ADI,
    url: SITE_URL,
    inLanguage: "tr-TR",
    description: SEO_ACIKLAMA,
    publisher: { "@type": "Organization", name: SITE_ADI, url: SITE_URL },
  };
}

/** Ana hizmet — AI motorlarının “ne işe yarar” sorusuna net yanıt */
export function serviceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Acil çekici ve yol yardım talebi",
    serviceType: "Roadside assistance marketplace",
    description: SEO_ACIKLAMA,
    provider: {
      "@type": "Organization",
      name: SITE_ADI,
      url: SITE_URL,
    },
    areaServed: { "@type": "Country", name: "Türkiye" },
    audience: {
      "@type": "Audience",
      audienceType: "Yolda kalan sürücüler ve yol yardım hizmet verenleri",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "TRY",
      description: "Müşteri talep oluşturma ücretsizdir",
    },
  };
}

export function faqJsonLd(
  maddeler: ReadonlyArray<{ soru: string; cevap: string }> = SSS_MADDELERI
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: maddeler.map((m) => ({
      "@type": "Question",
      name: m.soru,
      acceptedAnswer: {
        "@type": "Answer",
        text: m.cevap,
      },
    })),
  };
}
