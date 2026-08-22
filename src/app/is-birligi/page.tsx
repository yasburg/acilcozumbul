import Image from "next/image";
import Link from "next/link";
import { BrandLogoYazili } from "@/components/BrandLogo";
import { EpostaGonderCta } from "@/components/EpostaGonderCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { YasalSiteFooter } from "@/components/yasal/YasalSiteFooter";
import { organizationJsonLd, sayfaMetadata, webSiteJsonLd } from "@/lib/seo";
import { YASAL_SIRKET } from "@/lib/yasal-sirket";

export const dynamic = "force-static";

const TITLE = "İş Birliği | Acil Çözüm Bul";
const DESCRIPTION =
  "Acil Çözüm Bul ile iş birliği: yol yardım ekosisteminde güç birliği, proje ortaklığı ve kurumsal iş fırsatları için bize yazın.";

export const metadata = sayfaMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/is-birligi",
  absoluteTitle: true,
});

function IsBirligiGorsel() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 sm:aspect-auto sm:min-h-[280px]">
      <Image
        src="/is-birligi-gorsel.png"
        alt="İş birliği — güç birliği"
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, 480px"
        priority
      />
    </div>
  );
}

export default function IsBirligiPage() {
  const eposta = YASAL_SIRKET.eposta;

  return (
    <>
      <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />
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
            İş Birliği
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Güç birliğiyle daha hızlı çözüm.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-0 sm:grid-cols-2">
              <IsBirligiGorsel />
              <div className="flex flex-col justify-center space-y-4 p-5 sm:p-6">
                <p className="text-base leading-relaxed text-slate-700">
                  Sürücülere acil yol yardım sunan platformumuzda katılımcı bir
                  yaklaşımla güç birliği yapmaya her zaman açığız.{" "}
                  <strong className="font-semibold text-slate-900">
                    {YASAL_SIRKET.platformAdi}
                  </strong>{" "}
                  ile birlikte yürütebileceğinize inandığınız projeleriniz,
                  kurumsal çözümleriniz veya bölgesel ortaklık önerileriniz varsa{" "}
                  <a
                    href={`mailto:${eposta}`}
                    className="font-semibold text-[var(--acb-primary,#089b2d)] underline-offset-2 hover:underline"
                  >
                    {eposta}
                  </a>{" "}
                  adresinden bizimle iletişime geçebilirsiniz.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span className="text-[var(--acb-primary,#089b2d)]" aria-hidden>
                      —
                    </span>
                    Filo / kurumsal yol yardım entegrasyonu
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--acb-primary,#089b2d)]" aria-hidden>
                      —
                    </span>
                    Medya, içerik ve marka ortaklıkları
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--acb-primary,#089b2d)]" aria-hidden>
                      —
                    </span>
                    Teknoloji ve servis sağlayıcı iş birlikleri
                  </li>
                </ul>
                <EpostaGonderCta eposta={eposta} />
              </div>
            </div>
          </div>
        </main>

        <YasalSiteFooter />
      </div>
    </>
  );
}
