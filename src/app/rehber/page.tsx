import Link from "next/link";
import Image from "next/image";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoBreadcrumb } from "@/components/seo/SeoBreadcrumb";
import { rehberYaziListesi } from "@/data/rehber";
import { organizationJsonLd, sayfaMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo-jsonld";

export const dynamic = "force-static";

const PATH = "/rehber";
const TITLE = "Yol yardım rehberi — çekici, lastik, akü ve daha fazlası";
const DESC =
  "Yolda kalma, çekici fiyatı, lastikçi, akü takviye ve güvenli yardım çağırma üzerine pratik rehber yazıları.";

export const metadata = sayfaMetadata({
  title: TITLE,
  description: DESC,
  path: PATH,
});

export default function RehberIndexPage() {
  const yazilar = rehberYaziListesi();
  const breadcrumb = [
    { name: "Ana sayfa", path: "/" },
    { name: "Rehber", path: PATH },
  ];

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          breadcrumbJsonLd(breadcrumb),
          webPageJsonLd({ name: TITLE, description: DESC, path: PATH }),
        ]}
      />
      <main>
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <SeoBreadcrumb ogeler={breadcrumb} />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Yol yardım rehberi
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-slate-600">
            Çekici, lastikçi, akü, anahtarcı ve yolda kalma senaryoları için kısa,
            uygulanabilir yazılar. Her yazının sonunda ilgili şehir/hizmet
            sayfalarına ve talep formuna bağlantı vardır.
          </p>

          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {yazilar.map((y) => (
              <li key={y.slug}>
                <Link
                  href={`/rehber/${y.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-amber-400"
                >
                  <div className="relative aspect-[16/10] bg-slate-100">
                    <Image
                      src={y.heroSrc}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="text-base font-semibold leading-snug text-slate-900 group-hover:text-slate-700">
                      {y.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                      {y.description}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}
