import Link from "next/link";
import { BrandLogoYazili } from "@/components/BrandLogo";
import { JsonLd } from "@/components/seo/JsonLd";
import { YasalSiteFooter } from "@/components/yasal/YasalSiteFooter";
import {
  faqJsonLd,
  organizationJsonLd,
  sayfaMetadata,
  SITE_ADI,
} from "@/lib/seo";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo-jsonld";

export const dynamic = "force-static";

const PATH = "/nasil-calisir";
const TITLE = "Nasıl Çalışır | Acil Çözüm Bul";
const DESCRIPTION =
  "Acil Çözüm Bul nasıl çalışır? Talep açın, yakındaki hizmet verenlerden teklif alın, size uygun olanı seçin. Müşteri talep ücretsizdir.";

const FAQ = [
  {
    soru: "Acil Çözüm Bul nedir?",
    cevap:
      "Acil Çözüm Bul, Türkiye'de yolda kalan sürücüleri yakındaki çekici, lastikçi, anahtarcı ve yol yardım hizmet verenleriyle buluşturan bir platformdur. Müşteri talep açar; hizmet verenler fiyat ve süre teklifi gönderir; müşteri birini seçer.",
  },
  {
    soru: "Nasıl çekici veya yol yardım çağırırım?",
    cevap:
      "Ana sayfada veya talep oluşturma ekranında sorun tipinizi seçin, telefonunuzu doğrulayın, konumunuzu paylaşın. Yakındaki hizmet verenlere bildirim gider; gelen tekliflerden size uygun olanı seçersiniz.",
  },
  {
    soru: "Talep oluşturmak ücretli mi?",
    cevap:
      "Hayır. Müşteri olarak talep oluşturmak ücretsizdir. Hizmet bedeli, seçtiğiniz hizmet verenin teklif ettiği tutardır; platform sabit fiyat yayınlamaz.",
  },
  {
    soru: "Hizmet veren kaydı ve teklif vermek ücretli mi?",
    cevap:
      "Kayıt ücretsizdir. Teklif vermek ücretsizdir. Hizmet verenler bölge taleplerinden SMS ve panel bildirimi almak için kredi kullanır; kazanç, müşteriyle anlaştıkları teklif tutarıdır.",
  },
  {
    soru: "Teklif seçince ne olur?",
    cevap:
      "Bir teklifi seçtiğinizde seçilen hizmet verenle telefon ve konum paylaşımı açılır. İsim, plaka veya özel adresiniz herkese açık SEO sayfalarında yayınlanmaz.",
  },
] as const;

export const metadata = sayfaMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  absoluteTitle: true,
});

export default function NasilCalisirPage() {
  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: PATH,
          }),
          breadcrumbJsonLd([
            { name: "Ana sayfa", path: "/" },
            { name: "Nasıl çalışır", path: PATH },
          ]),
          faqJsonLd([...FAQ]),
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
            {SITE_ADI} nasıl çalışır?
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Yolda kaldığınızda yakındaki onaylı çekici, lastikçi veya anahtarcılardan
            teklif alın. Akış üç adımdır: talep → teklif → seçim.
          </p>

          <ol className="mt-10 space-y-8">
            <li>
              <h2 className="text-xl font-semibold text-slate-900">
                1. Talep oluşturun
              </h2>
              <p className="mt-2 text-base leading-relaxed text-slate-700">
                Sorun tipinizi seçin (çekici, lastik, akü, yakıt, kaza, kilit
                vb.), telefonunuzu doğrulayın ve konumunuzu paylaşın. Talep
                oluşturmak ücretsizdir.
              </p>
            </li>
            <li>
              <h2 className="text-xl font-semibold text-slate-900">
                2. Teklifleri görün
              </h2>
              <p className="mt-2 text-base leading-relaxed text-slate-700">
                Yakındaki onaylı hizmet verenlere bildirim gider. Fiyat ve
                tahmini varış süresini onlar yazar; platform sabit fiyat
                dikte etmez.
              </p>
            </li>
            <li>
              <h2 className="text-xl font-semibold text-slate-900">
                3. Size uygun olanı seçin
              </h2>
              <p className="mt-2 text-base leading-relaxed text-slate-700">
                Gelen tekliflerden birini seçince seçilen hizmet verenle telefon
                ve konum paylaşımı açılır. Hizmet bedeli, tarafların anlaştığı
                teklif tutarıdır.
              </p>
            </li>
          </ol>

          <section className="mt-12">
            <h2 className="text-xl font-semibold text-slate-900">Ücret modeli</h2>
            <ul className="mt-3 space-y-2 text-base leading-relaxed text-slate-700">
              <li className="flex gap-2">
                <span className="text-slate-400" aria-hidden>
                  —
                </span>
                Müşteri talep oluşturma ücretsizdir
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400" aria-hidden>
                  —
                </span>
                Hizmet veren kaydı ve teklif vermek ücretsizdir
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400" aria-hidden>
                  —
                </span>
                Hizmet verenler SMS ve panel bildirimi için kredi kullanır
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400" aria-hidden>
                  —
                </span>
                Yol yardım hizmet bedeli müşteri ile hizmet veren arasındadır
              </li>
            </ul>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Talep oluştur
            </Link>
            <Link
              href="/talep-olustur"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Doğrudan talep formu
            </Link>
          </div>

          <section className="mt-12">
            <h2 className="text-xl font-semibold text-slate-900">
              Hizmet veren misiniz?
            </h2>
            <p className="mt-2 text-base leading-relaxed text-slate-700">
              Bölgenizdeki yol yardım taleplerine ücretsiz teklif verebilirsiniz.
              Kayıt ücretsizdir; müşteri sizi seçince telefon ve konum açılır.
              İsim, plaka veya özel adresiniz herkese açık sayfalarda
              yayınlanmaz.
            </p>
            <p className="mt-4 text-sm text-slate-600">
              <Link
                href="/hizmet-veren"
                className="font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900"
              >
                Hizmet veren sayfası
              </Link>
              {" · "}
              <Link
                href="/kayit/a"
                className="font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900"
              >
                Ücretsiz kayıt
              </Link>
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-semibold text-slate-900">
              Sık sorulan sorular
            </h2>
            <dl className="mt-4 space-y-5">
              {FAQ.map((m) => (
                <div key={m.soru}>
                  <dt className="font-semibold text-slate-900">{m.soru}</dt>
                  <dd className="mt-1.5 text-base leading-relaxed text-slate-700">
                    {m.cevap}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </main>

        <YasalSiteFooter />
      </div>
    </>
  );
}
