import Link from "next/link";
import { BrandLogoYazili } from "@/components/BrandLogo";
import { EpostaGonderCta } from "@/components/EpostaGonderCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { YasalSiteFooter } from "@/components/yasal/YasalSiteFooter";
import { organizationJsonLd, sayfaMetadata, SITE_ADI } from "@/lib/seo";
import { aboutPageJsonLd, breadcrumbJsonLd } from "@/lib/seo-jsonld";
import { YASAL_SIRKET } from "@/lib/yasal-sirket";

export const dynamic = "force-static";

const PATH = "/hakkimizda";
const TITLE = "Hakkımızda | Acil Çözüm Bul";
const DESCRIPTION =
  "Acil Çözüm Bul hakkında: Türkiye yol yardım eşleştirme platformu. İşleten şirket YSN LABS; iletişim destek@acilcozumbul.com.";

export const metadata = sayfaMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  absoluteTitle: true,
});

export default function HakkimizdaPage() {
  const eposta = YASAL_SIRKET.eposta;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          aboutPageJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: PATH,
          }),
          breadcrumbJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "Hakkımızda", path: PATH },
          ]),
        ]}
      />
      <div className="min-h-dvh bg-gradient-to-b from-amber-50/40 via-slate-50 to-white text-slate-900">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-amber-700 hover:text-amber-800"
            >
              ← Ana sayfa
            </Link>
            <BrandLogoYazili
              priority
              className="h-8 w-auto max-w-[160px] object-contain object-right sm:h-9 sm:max-w-[200px]"
            />
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-8 pb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">
            {SITE_ADI} hakkında
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Türkiye’de yolda kalan sürücüleri yakındaki çekici, lastikçi,
            anahtarcı ve yol yardım hizmet verenleriyle buluşturan bir
            eşleştirme platformuyuz.
          </p>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900">Misyonumuz</h2>
            <p className="mt-2 text-base leading-relaxed text-slate-700">
              Acil durumda sürücünün yakındaki onaylı hizmet verenlerden fiyat
              ve süre teklifi almasını, kendine uygun olanı seçmesini sağlamak.
              Platform şeffaf bir eşleştirme katmanıdır; yol yardım hizmetini
              yerinde biz vermeyiz.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900">
              İşleten şirket
            </h2>
            <p className="mt-2 text-base leading-relaxed text-slate-700">
              Platform, {YASAL_SIRKET.kisaUnvan} ({YASAL_SIRKET.unvan}) tarafından
              işletilir.
            </p>
            <dl className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                <dt className="shrink-0 font-medium text-slate-500 sm:w-28">
                  Adres
                </dt>
                <dd>{YASAL_SIRKET.adres}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                <dt className="shrink-0 font-medium text-slate-500 sm:w-28">
                  Vergi no
                </dt>
                <dd>{YASAL_SIRKET.vergiNo}</dd>
              </div>
              <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                <dt className="shrink-0 font-medium text-slate-500 sm:w-28">
                  E-posta
                </dt>
                <dd>
                  <a
                    href={`mailto:${eposta}`}
                    className="font-medium text-[var(--acb-primary,#089b2d)] underline-offset-2 hover:underline"
                  >
                    {eposta}
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900">
              Ne yapıyoruz / ne yapmıyoruz
            </h2>
            <ul className="mt-3 space-y-2 text-base leading-relaxed text-slate-700">
              <li className="flex gap-2">
                <span className="text-slate-400" aria-hidden>
                  —
                </span>
                Talep ile teklifi buluştururuz; fiyatı hizmet veren yazar
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400" aria-hidden>
                  —
                </span>
                Çekici, lastik veya anahtar hizmetini kendimiz vermeyiz
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400" aria-hidden>
                  —
                </span>
                Sabit fiyat veya “en ucuz / en iyi” garantisi vermeyiz
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400" aria-hidden>
                  —
                </span>
                Hizmet veren kimliği, plaka veya müşteri konumu SEO sayfalarında
                yayınlanmaz
              </li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900">Marka</h2>
            <p className="mt-2 text-base leading-relaxed text-slate-700">
              Platform adı <strong className="font-semibold">{SITE_ADI}</strong>
              ’dur ({YASAL_SIRKET.platformDomain}). Görsel kimlik ACB marka
              varlıklarıyla sunulur.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-900">İletişim</h2>
            <p className="mt-2 text-base leading-relaxed text-slate-700">
              Destek ve sorularınız için {eposta} adresine yazabilirsiniz.
              Kurumsal ortaklık ve proje önerileri için{" "}
              <Link
                href="/is-birligi"
                className="font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900"
              >
                iş birliği
              </Link>{" "}
              sayfamıza bakın.
            </p>
            <div className="mt-5">
              <EpostaGonderCta
                eposta={eposta}
                subject="İletişim — Acil Çözüm Bul"
              />
            </div>
          </section>
        </main>

        <YasalSiteFooter />
      </div>
    </>
  );
}
