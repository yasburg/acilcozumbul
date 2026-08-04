import Link from "next/link";

/** Ana sayfa — çekici fiyatının nasıl hesaplandığına yönlendiren teaser */
export function AnaSayfaFiyatHesaplamaTeaser() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-5 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Çekici fiyatı nasıl hesaplanır?
          </h2>
          <p className="text-sm leading-snug text-slate-600">
            Mesafe, araç tipi ve saat dilimine göre 2026 tahmini bandı görün;
            sonra yakındaki firmalardan gerçek teklif alın.
          </p>
        </div>
        <Link
          href="/cekici-fiyat-hesaplama"
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-900 transition hover:bg-amber-100"
        >
          Fiyat hesapla
        </Link>
      </div>
    </section>
  );
}
