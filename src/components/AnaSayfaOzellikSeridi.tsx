/** Ana sayfa özellik şeridi — enyakin tarzı 4 sütun, telefonsuz */

const OZELLIKLER = [
  {
    baslik: "7/24 hizmetinizdeyiz",
    aciklama: "Burada siz sorunu paylaşın, biz sizi arayıp gelelim",
    ikon: (
      <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden>
        <path
          d="M4.5 10.5v-1A7.5 7.5 0 0 1 12 2a7.5 7.5 0 0 1 7.5 7.5v1"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M4 11.5h1.8A1.7 1.7 0 0 1 7.5 13.2v2.1A1.7 1.7 0 0 1 5.8 17H4.5A1.5 1.5 0 0 1 3 15.5v-2.5A1.5 1.5 0 0 1 4.5 11.5Zm16 0h-1.8a1.7 1.7 0 0 0-1.7 1.7v2.1a1.7 1.7 0 0 0 1.7 1.7h1.3A1.5 1.5 0 0 0 21 15.5v-2.5a1.5 1.5 0 0 0-1.5-1.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M16.5 17.5v.8A2.7 2.7 0 0 1 13.8 21h-1.1a2 2 0 0 1-2-2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    baslik: "Güvenilir Hizmet",
    aciklama: "%100 Onaylı güvenilir işletmelerden dilediğinizi seçin",
    ikon: (
      <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden>
        <path
          d="M12 2.8 4.8 5.6v5.2c0 4.6 3.1 8.8 7.2 10 4.1-1.2 7.2-5.4 7.2-10V5.6L12 2.8Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="m8.8 12 2.2 2.2 4.4-4.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    baslik: "Seçin, Karşılaştırın",
    aciklama: "En iyi işletmelerden en uygun fiyatları karşılaştırın",
    ikon: (
      <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden>
        <circle cx="8" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="16" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="15.5" r="2.4" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="m14.2 7.4 1.4-2.2M9.8 7.4 8.4 5.2M12 13.2V11"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    baslik: "Yakınında Bulun",
    aciklama: "Size en yakın işletmelerden hızlı ve uygun hizmet alın",
    ikon: (
      <svg viewBox="0 0 24 24" className="size-7" fill="none" aria-hidden>
        <path
          d="M8 3.8h8.2A2.2 2.2 0 0 1 18.4 6v12.5a1.3 1.3 0 0 1-2 1.1l-1.7-1-1.7 1a1.3 1.3 0 0 1-1.3 0l-1.7-1-1.7 1a1.3 1.3 0 0 1-2-1.1V6A2.2 2.2 0 0 1 8 3.8Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <circle cx="14.2" cy="11.2" r="3.1" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="m16.3 13.3 2.2 2.2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

export function AnaSayfaOzellikSeridi() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-6 sm:px-5">
      <h2 className="text-center text-lg sm:text-xl font-bold tracking-tight text-slate-900">
        <span className="text-amber-600">Acil Çözüm Bul</span>
        <span className="text-slate-700"> “En hızlı ve uygun çözüm”</span>
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-4">
        {OZELLIKLER.map((o) => (
          <li key={o.baslik} className="flex flex-col items-center text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm shadow-amber-500/25">
              {o.ikon}
            </span>
            <p className="mt-3 text-sm font-bold text-slate-900 leading-snug">
              {o.baslik}
            </p>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              {o.aciklama}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
