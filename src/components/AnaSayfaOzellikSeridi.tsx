/** Ana sayfa özellik şeridi — Yüksek kontrastlı Uber tarzı kart ızgarası */

function Ikon724() {
  return (
    <svg viewBox="0 0 64 64" className="size-full" fill="none" aria-hidden>
      <rect x="1" y="1" width="62" height="62" rx="19" fill="#dcfce7" stroke="#86efac" strokeWidth="1.5" />
      <path
        d="M18 28.5v-2A14 14 0 0 1 32 12.5 14 14 0 0 1 46 26.5v2"
        stroke="#15803d"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <rect
        x="14"
        y="28"
        width="10"
        height="16"
        rx="3.5"
        fill="white"
        stroke="#15803d"
        strokeWidth="2.4"
      />
      <rect
        x="40"
        y="28"
        width="10"
        height="16"
        rx="3.5"
        fill="white"
        stroke="#15803d"
        strokeWidth="2.4"
      />
      <path
        d="M42 44.5v2.2A6.5 6.5 0 0 1 35.5 53h-2.2a4.8 4.8 0 0 1-4.8-4.8"
        stroke="#15803d"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IkonGuven() {
  return (
    <svg viewBox="0 0 64 64" className="size-full" fill="none" aria-hidden>
      <rect x="1" y="1" width="62" height="62" rx="19" fill="#dcfce7" stroke="#86efac" strokeWidth="1.5" />
      <path
        d="M32 12.5 17.5 18v12.2c0 9.6 6.4 18.2 14.5 20.8 8.1-2.6 14.5-11.2 14.5-20.8V18L32 12.5Z"
        fill="white"
        stroke="#15803d"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="m24.5 32.2 5 5 10.2-10.4"
        stroke="#15803d"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IkonKarsilastir() {
  return (
    <svg viewBox="0 0 64 64" className="size-full" fill="none" aria-hidden>
      <rect x="1" y="1" width="62" height="62" rx="19" fill="#dcfce7" stroke="#86efac" strokeWidth="1.5" />
      <circle cx="23" cy="26" r="7.2" fill="white" stroke="#15803d" strokeWidth="2.4" />
      <circle cx="41" cy="26" r="7.2" fill="white" stroke="#15803d" strokeWidth="2.4" />
      <circle cx="32" cy="43" r="7.2" fill="white" stroke="#15803d" strokeWidth="2.4" />
      <path
        d="m28.2 20.4 2.2-5.2M35.8 20.4 33.6 15.2M32 35.8V31"
        stroke="#15803d"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IkonYakin() {
  return (
    <svg viewBox="0 0 64 64" className="size-full" fill="none" aria-hidden>
      <rect x="1" y="1" width="62" height="62" rx="19" fill="#dcfce7" stroke="#86efac" strokeWidth="1.5" />
      <path
        d="M32 13.5c-7.2 0-13 5.6-13 12.6 0 9.4 13 24.4 13 24.4s13-15 13-24.4c0-7-5.8-12.6-13-12.6Z"
        fill="white"
        stroke="#15803d"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="26" r="4.4" fill="#15803d" />
    </svg>
  );
}

const OZELLIKLER = [
  {
    baslik: "7/24 hizmetinizdeyiz",
    aciklama: "Burada siz sorunu paylaşın, biz sizi arayıp gelelim",
    ikon: <Ikon724 />,
  },
  {
    baslik: "Güvenilir Hizmet",
    aciklama: "%100 Onaylı güvenilir işletmelerden dilediğinizi seçin",
    ikon: <IkonGuven />,
  },
  {
    baslik: "Seçin, Karşılaştırın",
    aciklama: "En iyi işletmelerden en uygun fiyatları karşılaştırın",
    ikon: <IkonKarsilastir />,
  },
  {
    baslik: "Yakınında Bulun",
    aciklama: "Size en yakın işletmelerden hızlı ve uygun hizmet alın",
    ikon: <IkonYakin />,
  },
] as const;

export function AnaSayfaOzellikSeridi() {
  return (
    <section>
      <h2 className="max-w-[18ch] text-[1.65rem] font-bold leading-[1.15] tracking-tight text-[var(--acb-dark)] sm:max-w-none sm:text-3xl">
        Acil Çözüm Bul ile neler yapabilirsiniz
      </h2>
      <ul className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
        {OZELLIKLER.map((o) => (
          <li key={o.baslik}>
            <article className="flex min-h-[10.5rem] items-stretch overflow-hidden rounded-[1.25rem] bg-white border border-slate-200/80 p-5 sm:min-h-[12rem] sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all hover:border-slate-300 hover:shadow-md">
              <div className="flex min-w-0 flex-1 flex-col pr-2 sm:pr-3">
                <h3 className="text-[1.05rem] font-bold leading-snug tracking-tight text-[var(--acb-dark)] sm:text-lg">
                  {o.baslik}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--acb-dark)]/70 sm:mt-2">
                  {o.aciklama}
                </p>
              </div>
              <div className="flex w-[4.5rem] shrink-0 items-end justify-end self-end sm:w-[5.5rem]">
                <span className="block size-[4.5rem] sm:size-[5.5rem]">{o.ikon}</span>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
