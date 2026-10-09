import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoBreadcrumb } from "@/components/seo/SeoBreadcrumb";
import { rehberMetinLinkli } from "@/components/seo/rehber-metin";
import type { RehberYazi } from "@/data/rehber";
import { faqJsonLd } from "@/lib/seo";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  webPageJsonLd,
} from "@/lib/seo-jsonld";

export function RehberMakaleShell({ yazi }: { yazi: RehberYazi }) {
  const path = `/rehber/${yazi.slug}`;
  const breadcrumb = [
    { name: "Ana sayfa", path: "/" },
    { name: "Rehber", path: "/rehber" },
    { name: yazi.title, path },
  ];
  const oncekiRehber = yazi.linkler.filter((l) => l.href.startsWith("/rehber/"));
  const digerLinkler = yazi.linkler.filter((l) => !l.href.startsWith("/rehber/"));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(breadcrumb),
          webPageJsonLd({
            name: yazi.title,
            description: yazi.description,
            path,
          }),
          articleJsonLd({
            title: yazi.title,
            description: yazi.description,
            path,
            datePublished: yazi.tarih,
            imagePath: yazi.heroSrc,
          }),
          faqJsonLd(yazi.faq),
        ]}
      />
      <main>
        <article className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
          <SeoBreadcrumb ogeler={breadcrumb} />

          <header className="mt-6">
            <p className="text-sm font-medium tracking-wide text-slate-500">
              Rehber ·{" "}
              <time dateTime={yazi.tarih}>
                {new Date(yazi.tarih + "T12:00:00").toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-[2.15rem] sm:leading-tight">
              {yazi.title}
            </h1>
          </header>

          <aside
            className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-4 sm:px-5"
            aria-labelledby="rehber-kisaca"
          >
            <p
              id="rehber-kisaca"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-900/80"
            >
              Kısaca{" "}
              <span className="font-normal normal-case tracking-normal text-amber-800/60">
                (TL;DR)
              </span>
            </p>
            <p className="mt-2 text-base leading-relaxed text-slate-800">
              {rehberMetinLinkli(yazi.kisaca)}
            </p>
          </aside>

          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <Image
              src={yazi.heroSrc}
              alt={yazi.heroAlt}
              fill
              priority
              sizes="(max-width: 672px) 100vw, 672px"
              className="object-cover"
            />
          </div>

          <div className="mt-10 space-y-8">
            {yazi.bolumler.map((b) => (
              <section key={b.baslik}>
                <h2 className="text-xl font-bold text-slate-900">{b.baslik}</h2>
                <div className="mt-3 space-y-3">
                  {b.paragraflar.map((p) => (
                    <p
                      key={p.slice(0, 48)}
                      className="leading-relaxed text-slate-700"
                    >
                      {rehberMetinLinkli(p)}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-10 rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-5">
            <h2 className="text-base font-semibold text-slate-900">
              Sık sorulan sorular
            </h2>
            <dl className="mt-4 space-y-4">
              {yazi.faq.map((m) => (
                <div key={m.soru}>
                  <dt className="text-sm font-semibold text-slate-900">
                    {m.soru}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-600">
                    {rehberMetinLinkli(m.cevap)}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {oncekiRehber.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-slate-900">
                Önceki rehber yazıları
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Bu konuya gelmeden önce yayımladığımız ilgili yazılar:
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {oncekiRehber.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-900 transition hover:border-amber-400 hover:bg-amber-50"
                    >
                      <span className="min-w-0 flex-1">{l.label}</span>
                      <span className="text-slate-400" aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {digerLinkler.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-slate-900">İlgili sayfalar</h2>
              <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {digerLinkler.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-900 transition hover:border-amber-400 hover:bg-amber-50"
                    >
                      <span className="min-w-0 flex-1">{l.label}</span>
                      <span className="text-slate-400" aria-hidden>
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={yazi.ctaHref}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {yazi.ctaLabel}
            </Link>
            <Link
              href="/rehber"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Tüm rehberler
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
