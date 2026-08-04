import Link from "next/link";
import { DESTEKLENEN_ILLER } from "@/lib/il-ilce";
import { sehirSlug } from "@/lib/seo-slug";
import { illerSecimSirasi } from "@/lib/turkiye-il-nufus";

/** Ana sayfa — yalnızca şehir hub linkleri (`/{sehir}`) */
const SEHIR_LINKLER = illerSecimSirasi(DESTEKLENEN_ILLER).map((ad) => ({
  label: ad,
  href: `/${sehirSlug(ad)}`,
}));

export function AnaSayfaHizliBaglantilar() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-6 sm:px-5">
      <div className="text-center space-y-1.5">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-snug">
          Uzaklarda arama, acilcozumbul.com 81 ilde hep yanında!
        </h2>
        <p className="text-sm text-slate-600">
          En hızlı ve uygun çözüm, sen neredeysen orada.
        </p>
      </div>
      <ul className="mt-5 flex flex-wrap justify-center gap-2">
        {SEHIR_LINKLER.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
