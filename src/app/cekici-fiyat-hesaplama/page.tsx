import Link from "next/link";
import { BrandLogoYazili } from "@/components/BrandLogo";
import { JsonLd } from "@/components/seo/JsonLd";
import { CekiciFiyatHesaplamaAraci } from "@/components/cekici/CekiciFiyatHesaplamaAraci";
import { YasalSiteFooter } from "@/components/yasal/YasalSiteFooter";
import {
  cekiciFiyatTahmini,
  rotaMesafeKm,
  tlYazi,
} from "@/lib/cekici-fiyat-hesaplama";
import {
  faqJsonLd,
  organizationJsonLd,
  sayfaMetadata,
  webSiteJsonLd,
} from "@/lib/seo";

export const dynamic = "force-static";

const TITLE = "Çekici Fiyat Hesaplama 2026 | Acil Çözüm Bul";
const DESCRIPTION =
  "Çekici fiyat hesaplama aracı ile şehir içi ve şehirler arası oto çekici ücret bandını öğrenin. Mesafe, araç tipi, gece-gündüz ve kurtarma durumuna göre 2026 tahmini çekici fiyatı.";

const FAQ = [
  {
    soru: "Çekici fiyatı nasıl hesaplanır?",
    cevap:
      "Çekici fiyatı mesafe, şehir (trafik), taşınacak araç tipi, hizmet saati, aracın durumu (kilitli tekerlek, kazalı kurtarma) ve otoyol/köprü geçişleri gibi etkenlere göre değişir. Firmalar kendi tarifelerini uygular; platform sabit fiyat yayınlamaz.",
  },
  {
    soru: "Şehir içi ile şehirler arası çekici fiyatı neden farklı?",
    cevap:
      "Şehir içi kısa mesafelerde taban ücret ve kısa dilim km bedeli daha yüksektir. Şehirler arası uzun mesafede km başı ücret genelde düşer; buna karşın toplam tutar mesafeyle artar.",
  },
  {
    soru: "Hesaplanan fiyat kesin midir?",
    cevap:
      "Hayır. Araç yalnızca ortalama bir band gösterir. Kesin ücret, yakındaki çekici firmalarının size gönderdiği tekliflerle belirlenir.",
  },
] as const;

/** Popüler şehirler arası rotalar — tabloda gündüz / otomobil / otoyol varsayımı */
const SEHIRLER_ARASI_ORNEK_ROTALAR = [
  ["İstanbul", "Ankara"],
  ["Ankara", "İzmir"],
  ["İstanbul", "İzmir"],
  ["İstanbul", "Bursa"],
  ["İstanbul", "Adana"],
  ["Ankara", "Bursa"],
  ["İstanbul", "Trabzon"],
  ["İstanbul", "Gaziantep"],
  ["İzmir", "Samsun"],
] as const;

function sehirlerArasiOrnekSatirlari() {
  return SEHIRLER_ARASI_ORNEK_ROTALAR.map(([nereden, nereye]) => {
    const mesafeKm =
      rotaMesafeKm({ cikisIl: nereden, varisIl: nereye }) ?? 100;
    const fiyat = cekiciFiyatTahmini({
      sehirAd: nereden,
      kapsam: "sehirler_arasi",
      mesafeKm,
      aracTipi: "otomobil",
      saat: "gunduz",
      durum: "standart",
      otoyolGecis: true,
    });
    return { nereden, nereye, mesafeKm, ...fiyat };
  });
}

export const metadata = sayfaMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/cekici-fiyat-hesaplama",
  absoluteTitle: true,
});

export default function CekiciFiyatHesaplamaPage() {
  const ornekSatirlar = sehirlerArasiOrnekSatirlari();

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webSiteJsonLd(),
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

        <main className="mx-auto max-w-3xl px-4 py-8 pb-6">
          <p className="text-sm font-medium tracking-wide text-amber-700">
            Oto çekici & kurtarıcı
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-[2rem]">
            Çekici fiyat hesaplama
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            2026 için şehir içi ve şehirler arası{" "}
            <strong className="font-semibold text-slate-800">
              çekici fiyat hesaplama
            </strong>{" "}
            bandını görün. Mesafe dilimleri, araç tipi, gece-gündüz farkı ve
            kurtarma durumuna göre ortalama oto çekici ücret aralığı çıkar;
            kesin fiyatı yakındaki firmalardan teklif alarak seçersiniz.
          </p>

          <div className="mt-6">
            <CekiciFiyatHesaplamaAraci />
          </div>

          <article className="mt-12 space-y-8 text-sm leading-relaxed text-slate-700">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                Oto çekici ve kurtarıcı fiyatı nasıl hesaplanır?
              </h2>
              <p>
                Çekici fiyatını hesaplarken öne çıkan etkenler mesafe ve süre,
                çekilecek aracın tipi ve durumu, hizmetin gece veya gündüz
                verilmesi, firmanın araca uzaklığı ile otoyol / köprü gibi ek
                geçişlerdir. Net tek bir tarife yoktur; her çekici firması kendi
                hesabına göre teklif verir.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                Mesafe ve sürenin çekici fiyatına etkisi
              </h2>
              <p>
                Kısa mesafelerde km başı tutar yüksek görünebilir çünkü taban
                (çağrı) ücreti payı büyüktür. Mesafe uzadıkça km başı bedel
                genelde düşer. İstanbul, Ankara, İzmir gibi yoğun şehirlerde aynı
                km, trafiğe bağlı süre yüzünden daha maliyetli olabilir; bazı
                illerdeki uzun mesafe şehirler arası çekici ücreti ile şehir içi
                kısa mesafe birbirine yaklaşabilir.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                Şehir içi çekici fiyat hesaplama
              </h2>
              <p>
                Şehir içi çekici fiyatları kısa mesafe dilimleri ve taban ücret
                üzerinden şekillenir. Aracın trafikte, otoparkta veya dar
                sokakta kalması; özel manevra gerektirmesi ücreti
                etkileyebilir. Büyükşehirlerde şehir içi çekici fiyat bandı
                genellikle daha yüksektir.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                Şehirler arası çekici fiyat hesaplama
              </h2>
              <p>
                Şehirler arası oto çekici fiyatında toplam km artar; buna karşılık
                km başı ortalama düşebilir. Uzun yolda otoyol ve köprü geçiş
                ücretleri de hesaba katılabilir. Araç tipine göre (otomobil,
                SUV, minibüs, kamyon, motosiklet, karavan) farklı ekipman
                gerektiği için band genişler.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                Taşınacak aracın ve zamanın etkisi
              </h2>
              <p>
                Otomobil, arazi / SUV / pickup, minivan, minibüs, kamyon,
                otobüs, motosiklet veya karavan için çekici fiyatı değişir.
                Tekerleklerin kilitli olması, kazalı veya ters durum kurtarma
                ek ücreti getirebilir. Gece çekici fiyatları gündüze göre daha
                yüksek olabilir.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                2026 şehirler arası oto çekici fiyatları
              </h2>
              <p>
                Aşağıdaki örnekler gündüz, standart otomobil ve otoyol geçişli
                varsayımla üretilmiş tahmini bantlardır; gidiş-dönüş dahildir.
                Gerçek teklifler firmaya ve koşullara göre değişir.
              </p>
              <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2.5 font-semibold">Nereden</th>
                      <th className="px-3 py-2.5 font-semibold">Nereye</th>
                      <th className="px-3 py-2.5 font-semibold text-right">
                        En düşük
                      </th>
                      <th className="px-3 py-2.5 font-semibold text-right">
                        Ortalama
                      </th>
                      <th className="px-3 py-2.5 font-semibold text-right">
                        En yüksek
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ornekSatirlar.map((s) => (
                      <tr
                        key={`${s.nereden}-${s.nereye}`}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-3 py-2.5 font-medium text-slate-900">
                          {s.nereden}
                        </td>
                        <td className="px-3 py-2.5 text-slate-700">
                          {s.nereye}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                          {tlYazi(s.dusuk)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-amber-900">
                          {tlYazi(s.orta)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">
                          {tlYazi(s.yuksek)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                Çekici fiyat hesaplama aracı 2026
              </h2>
              <p>
                Bu sayfadaki çekici fiyat hesaplama 2026 aracı, dilimli mesafe
                tarifesi ve çarpanlarla ortalama bir band üretir. Sonuç kesinlik
                taşımaz. Gerçek teklif için Acil Çözüm Bul üzerinden talep açın;
                yakındaki çekiciler fiyat ve tahmini varış süresi göndersin, siz
                uygun olanı seçin.
              </p>
              <p>
                <Link
                  href="/"
                  className="font-semibold text-amber-700 hover:underline"
                >
                  Ana sayfadan teklif al →
                </Link>
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">
                Sık sorulan sorular
              </h2>
              <dl className="space-y-4">
                {FAQ.map((f) => (
                  <div key={f.soru}>
                    <dt className="font-semibold text-slate-900">{f.soru}</dt>
                    <dd className="mt-1 text-slate-600">{f.cevap}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </article>
        </main>

        <YasalSiteFooter />
      </div>
    </>
  );
}
