import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  CEKICI_KAYIT_SEO,
  organizationJsonLd,
  sayfaMetadata,
  serviceJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

export const metadata = sayfaMetadata({
  title: CEKICI_KAYIT_SEO.title,
  description: CEKICI_KAYIT_SEO.description,
  path: "/hizmet-veren",
});

/** Public SEO sayfası — gerçek kayıt formu /kayit/* (noindex) */
export default function HizmetVerenSeoPage() {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), serviceJsonLd()]} />
      <main className="min-h-dvh bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
          <p className="text-sm font-medium tracking-wide text-slate-500">
            Acil Çözüm Bul
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Çekici, lastikçi ve anahtarcı olarak kayıt olun
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            Bölgenizdeki yol yardım taleplerine ücretsiz teklif verin. Kayıt
            ücretsizdir; müşteri sizi seçince telefon ve konum açılır. İsim,
            plaka veya özel adresiniz herkese açık sayfalarda yayınlanmaz.
          </p>
          <ul className="mt-8 space-y-3 text-slate-700">
            <li className="flex gap-2">
              <span className="text-slate-400" aria-hidden>
                —
              </span>
              Yakın talepleri SMS ve panel ile görün
            </li>
            <li className="flex gap-2">
              <span className="text-slate-400" aria-hidden>
                —
              </span>
              Fiyat ve varış sürenizi siz yazın
            </li>
            <li className="flex gap-2">
              <span className="text-slate-400" aria-hidden>
                —
              </span>
              Teklif vermek ücretsizdir
            </li>
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/kayit/a"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Ücretsiz kayıt ol
            </Link>
            <Link
              href="/cekici/giris"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Giriş yap
            </Link>
          </div>
          <p className="mt-10 text-sm text-slate-500">
            <Link href="/" className="underline underline-offset-2">
              Ana sayfa
            </Link>
            {" · "}
            <Link href="/istanbul" className="underline underline-offset-2">
              İstanbul yol yardım
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
