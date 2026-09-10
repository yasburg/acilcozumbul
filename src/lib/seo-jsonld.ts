import { SITE_ADI, SITE_URL, sayfaUrl } from "@/lib/seo";

export type BreadcrumbOge = { name: string; path: string };

export function breadcrumbJsonLd(ogeler: BreadcrumbOge[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: ogeler.map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: o.name,
      item: sayfaUrl(o.path),
    })),
  };
}

export function bolgeselServiceJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  areaName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    serviceType: "Roadside assistance marketplace",
    description: opts.description,
    url: sayfaUrl(opts.path),
    provider: {
      "@type": "Organization",
      name: SITE_ADI,
      url: SITE_URL,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: opts.areaName,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "TRY",
      description: "Müşteri talep oluşturma ücretsizdir",
    },
  };
}

export function webPageJsonLd(opts: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    description: opts.description,
    url: sayfaUrl(opts.path),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_ADI,
      url: SITE_URL,
    },
    inLanguage: "tr-TR",
  };
}

export function aboutPageJsonLd(opts: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: opts.name,
    description: opts.description,
    url: sayfaUrl(opts.path),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_ADI,
      url: SITE_URL,
    },
    inLanguage: "tr-TR",
    mainEntity: {
      "@type": "Organization",
      name: SITE_ADI,
      url: SITE_URL,
    },
  };
}

export function articleJsonLd(opts: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  imagePath?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    datePublished: opts.datePublished,
    dateModified: opts.datePublished,
    inLanguage: "tr-TR",
    mainEntityOfPage: sayfaUrl(opts.path),
    author: {
      "@type": "Organization",
      name: SITE_ADI,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_ADI,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: sayfaUrl("/brand/acb/opening-logo.png"),
      },
    },
    ...(opts.imagePath
      ? { image: [sayfaUrl(opts.imagePath)] }
      : {}),
  };
}
