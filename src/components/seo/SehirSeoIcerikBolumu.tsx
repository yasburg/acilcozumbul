import Link from "next/link";
import {
  seoBolgeBaglantilari,
  type SeoLandingIcerik,
} from "@/lib/seo-icerik";
import { SeoMetin, type SeoMetinBaglanti } from "@/components/seo/SeoMetin";

type Yogunluk = "kompakt" | "genis";

/** Ana sayfa, /{sehir} ve /{sehir}/{ilce} ortak SEO gövdesi */
export function SehirSeoIcerikBolumu({
  icerik,
  sehirAd,
  heroBaslik,
  baglantilar,
  bolgeLinkleri,
  yogunluk = "kompakt",
}: {
  icerik: SeoLandingIcerik;
  /** Metin içi şehir/ilçe linkleri için */
  sehirAd: string;
  heroBaslik?: string;
  /** Verilmezse sehirAd üzerinden üretilir */
  baglantilar?: SeoMetinBaglanti[];
  /** Altta gösterilecek ilçe/bölge chip listesi */
  bolgeLinkleri?: SeoMetinBaglanti[];
  yogunluk?: Yogunluk;
}) {
  const linkler = baglantilar ?? seoBolgeBaglantilari(sehirAd);
  const chipLinkler =
    bolgeLinkleri ??
    (icerik.bolgeListesiBaslik
      ? linkler.filter((l) => l.ad !== sehirAd)
      : []);

  const h2 =
    yogunluk === "genis"
      ? "text-xl font-semibold text-slate-900"
      : "text-lg font-semibold text-slate-900";
  const govde =
    yogunluk === "genis"
      ? "text-base text-slate-700 leading-relaxed"
      : "text-sm text-slate-700 leading-relaxed";
  const bosluk = yogunluk === "genis" ? "space-y-10" : "space-y-8";

  return (
    <div className={`${bosluk} text-left`}>
      {heroBaslik ? (
        <div>
          <h2 className="text-[1.35rem] sm:text-[1.65rem] font-bold leading-snug tracking-tight text-slate-900">
            {heroBaslik}
          </h2>
          <SeoMetin
            metin={icerik.ozet}
            baglantilar={linkler}
            className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed"
          />
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className={h2}>{icerik.bolgeBaslik}</h2>
        {icerik.paragraflar.map((p) => (
          <SeoMetin
            key={p.slice(0, 48)}
            metin={p}
            baglantilar={linkler}
            className={govde}
          />
        ))}
      </section>

      <section>
        <h2 className={h2}>{icerik.senaryoBaslik}</h2>
        <ul
          className={`mt-2 list-disc space-y-1.5 pl-5 ${govde}`}
        >
          {icerik.senaryolar.map((s) => (
            <li key={s}>
              <SeoMetin metin={s} baglantilar={linkler} inline />
            </li>
          ))}
        </ul>
      </section>

      {icerik.bolgeListesiBaslik && chipLinkler.length > 0 ? (
        <section>
          <h2 className={h2}>{icerik.bolgeListesiBaslik}</h2>
          {icerik.bolgeListesiAlt ? (
            <SeoMetin
              metin={icerik.bolgeListesiAlt}
              baglantilar={linkler}
              className={`mt-2 ${govde}`}
            />
          ) : null}
          <ul className="mt-3 flex flex-wrap gap-2">
            {chipLinkler.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-950"
                >
                  {l.ad}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className={h2}>{icerik.fiyatBaslik}</h2>
        <SeoMetin
          metin={icerik.fiyatNotu}
          baglantilar={linkler}
          className={`mt-2 ${govde}`}
        />
      </section>

      <section>
        <h2 className={h2}>{icerik.guvenBaslik}</h2>
        <SeoMetin
          metin={icerik.guvenNotu}
          baglantilar={linkler}
          className={`mt-2 ${govde}`}
        />
      </section>

      <section>
        <h2 className={h2}>{icerik.faqBaslik}</h2>
        <dl className={yogunluk === "genis" ? "mt-4 space-y-5" : "mt-3 space-y-4"}>
          {icerik.faq.map((f) => (
            <div key={f.soru}>
              <dt className="text-sm font-medium text-slate-900">{f.soru}</dt>
              <dd className="mt-1">
                <SeoMetin
                  metin={f.cevap}
                  baglantilar={linkler}
                  className={govde}
                />
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export const ISTANBUL_ANA_HERO =
  "İstanbul Çekici: 7/24 En Yakın İstanbul Çekici ve Kurtarma Hizmetleri";
