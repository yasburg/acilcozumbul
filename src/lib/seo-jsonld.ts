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
