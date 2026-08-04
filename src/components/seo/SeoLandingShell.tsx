import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoBreadcrumb } from "@/components/seo/SeoBreadcrumb";
import { SehirSeoIcerikBolumu } from "@/components/seo/SehirSeoIcerikBolumu";
import { SeoMetin, type SeoMetinBaglanti } from "@/components/seo/SeoMetin";
import { faqJsonLd } from "@/lib/seo";
import {
  seoBolgeBaglantilari,
  type SeoLandingIcerik,
} from "@/lib/seo-icerik";
import {
  breadcrumbJsonLd,
  bolgeselServiceJsonLd,
  webPageJsonLd,
  type BreadcrumbOge,
} from "@/lib/seo-jsonld";

export type SeoIliskiLink = { href: string; label: string };

type Props = {
  icerik: SeoLandingIcerik;
  path: string;
  areaName: string;
  /** Metin linkleri için şehir adı (ilçe sayfasında areaName ilçe olabilir) */
  seoSehirAd?: string;
  breadcrumb: BreadcrumbOge[];
  ctaHref: string;
  ilgili?: SeoIliskiLink[];
  hizmetLinkleri?: SeoIliskiLink[];
  /** Üstte form benzeri seçim paneli (ilçe / hizmet) */
  secimBaslik?: string;
  secimAlt?: string;
  secimLinkleri?: SeoIliskiLink[];
  /** Metin içi şehir/ilçe <a> listesi */
  metinBaglantilari?: SeoMetinBaglanti[];
  /** Alt bölge chip listesi */
  bolgeLinkleri?: SeoMetinBaglanti[];
};

function SecimListesi({
  baslik,
  alt,
  linkler,
}: {
  baslik: string;
  alt?: string;
  linkler: SeoIliskiLink[];
}) {
  if (linkler.length === 0) return null;
  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{baslik}</h2>
      {alt ? <p className="mt-1 text-sm text-slate-600">{alt}</p> : null}
      <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {linkler.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-900 transition hover:border-amber-400 hover:bg-amber-50"
            >
              <span className="flex-1 min-w-0">{l.label}</span>
              <span className="text-slate-400" aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SeoLandingShell({
  icerik,
  path,
  areaName,
  seoSehirAd,
  breadcrumb,
  ctaHref,
  ilgili = [],
  hizmetLinkleri = [],
  secimBaslik,
  secimAlt,
  secimLinkleri = [],
  metinBaglantilari,
  bolgeLinkleri,
}: Props) {
  const secimVar = secimLinkleri.length > 0 && secimBaslik;
  const sehirAd = seoSehirAd ?? areaName;
  const baglantilar =
    metinBaglantilari ?? seoBolgeBaglantilari(sehirAd);
  /** Üstte ilçe seçimi varken alt chip listesini tekrarlama */
  const chipLinkler = bolgeLinkleri ?? (secimVar ? [] : undefined);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: icerik.h1,
            description: icerik.description,
            path,
          }),
          bolgeselServiceJsonLd({
            name: icerik.h1,
            description: icerik.description,
            path,
            areaName,
          }),
          breadcrumbJsonLd(breadcrumb),
          faqJsonLd(icerik.faq),
        ]}
      />
      <main className="min-h-dvh bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <SeoBreadcrumb ogeler={breadcrumb} />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {icerik.h1}
          </h1>
          <SeoMetin
            metin={icerik.ozet}
            baglantilar={baglantilar}
            className="mt-4 text-lg text-slate-600 leading-relaxed"
          />

          {secimVar ? (
            <SecimListesi
              baslik={secimBaslik}
              alt={secimAlt}
              linkler={secimLinkleri}
            />
          ) : (
            <div className="mt-8">
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-amber-500/20 hover:bg-amber-600"
              >
                {icerik.ctaEtiket}
              </Link>
            </div>
          )}

          {!secimVar && hizmetLinkleri.length > 0 ? (
            <SecimListesi baslik="Hizmetler" linkler={hizmetLinkleri} />
          ) : null}

          <div className="mt-12 border-t border-slate-200 pt-10">
            <SehirSeoIcerikBolumu
              icerik={icerik}
              sehirAd={sehirAd}
              baglantilar={baglantilar}
              bolgeLinkleri={chipLinkler}
              yogunluk="genis"
            />
          </div>

          {!secimVar && ilgili.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900">
                İlgili bölgeler
              </h2>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {ilgili.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-amber-800 underline underline-offset-2 hover:text-amber-950"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {secimVar && ilgili.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-slate-900">
                Diğer seçenekler
              </h2>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {ilgili.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-amber-800 underline underline-offset-2 hover:text-amber-950"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-12 border-t border-slate-200 pt-8">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-amber-500/20 hover:bg-amber-600"
            >
              {icerik.ctaEtiket}
            </Link>
            <p className="mt-6 text-sm text-slate-500">
              <Link href="/" className="underline underline-offset-2">
                Ana sayfa
              </Link>
              {" · "}
              <Link
                href="/hizmet-veren"
                className="underline underline-offset-2"
              >
                Hizmet veren ol
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
