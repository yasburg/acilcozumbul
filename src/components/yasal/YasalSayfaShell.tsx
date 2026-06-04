import Link from "next/link";
import { YASAL_GUNCELLEME, YASAL_LINKLER, YASAL_SIRKET } from "@/lib/yasal-sirket";

export function YasalSayfaShell({
  baslik,
  children,
}: {
  baslik: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-amber-700 hover:text-amber-800"
          >
            ← Ana sayfa
          </Link>
          <span className="text-xs text-slate-500">{YASAL_SIRKET.platformDomain}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 pb-16">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{baslik}</h1>
        <p className="text-sm text-slate-500 mb-8">
          Son güncelleme: {YASAL_GUNCELLEME} · {YASAL_SIRKET.unvan}
        </p>

        <article className="prose-yasal space-y-6 text-sm text-slate-700 leading-relaxed">
          {children}
        </article>

        <nav className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
            Diğer yasal metinler
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {YASAL_LINKLER.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-amber-700 hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-8 text-xs text-slate-500">
          İletişim:{" "}
          <a href={`mailto:${YASAL_SIRKET.eposta}`} className="text-amber-700">
            {YASAL_SIRKET.eposta}
          </a>
          <br />
          {YASAL_SIRKET.adres} · Vergi No: {YASAL_SIRKET.vergiNo}
        </p>
      </main>
    </div>
  );
}

export function YasalBolum({
  baslik,
  children,
}: {
  baslik: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">{baslik}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function YasalListe({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
