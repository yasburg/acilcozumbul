"use client";

import { SSS_MADDELERI } from "@/lib/seo";

/** Görünür SSS — FAQPage şemasıyla birlikte AI SEO için alıntılanabilir içerik */
export function SssBolumu() {
  return (
    <section
      className="mt-10 mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-5"
      aria-labelledby="sss-baslik"
    >
      <h2
        id="sss-baslik"
        className="text-base font-semibold text-slate-900 mb-1"
      >
        Sık sorulan sorular
      </h2>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        Acil Çözüm Bul ile çekici, lastikçi ve yol yardım talebi hakkında kısa
        cevaplar.
      </p>
      <dl className="space-y-4">
        {SSS_MADDELERI.map((m) => (
          <div key={m.soru}>
            <dt className="text-sm font-semibold text-slate-900">{m.soru}</dt>
            <dd className="text-sm text-slate-600 mt-1 leading-relaxed">
              {m.cevap}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
