"use client";

import { Btn, Card } from "@/components/ui";
import { OnayliCekiciRozeti } from "@/components/OnayliCekiciRozeti";

const AVANTAJLAR = [
  "Kayıt ücretsiz",
  "Teklif vermek ücretsiz",
  "İstanbul ilçe bazlı çalış",
] as const;

const IS_AKISI = [
  {
    ikon: "📲",
    baslik: "Bildirim gelir",
    aciklama: "Bölgenizde talep açılınca SMS + panel uyarısı",
  },
  {
    ikon: "💰",
    baslik: "Teklif verin",
    aciklama: "Fiyat ve varış sürenizi yazın — ücretsiz",
  },
  {
    ikon: "🤝",
    baslik: "Müşteri seçer",
    aciklama: "Sizi seçerse telefon ve konum açılır, işi siz tamamlarsınız",
  },
] as const;

const GUVEN_MADDELERI = [
  {
    ikon: "📱",
    baslik: "Telefon doğrulama",
    aciklama: "Kayıtta SMS ile numaranız doğrulanır",
  },
  {
    ikon: "📄",
    baslik: "Belge onayı",
    aciklama: "Ruhsat ve çekici belgesi panelden incelenir",
  },
  {
    ikon: "✓",
    baslik: "Onaylı çekici rozeti",
    aciklama: "Doğrulanan hesaplar müşteride üst sırada görünür",
    rozet: true,
  },
] as const;

const YORUMLAR = [
  {
    metin: "Teklif vermek bedava, iş gelince direkt arıyorlar. Kayıttan sonra aylık işlerim belirgin şekilde arttı.",
    ad: "Mehmet K.",
    rol: "Çekici · İstanbul",
  },
  {
    metin: "Kayıt 5 dakika sürdü. İlk ayda lastik işlerim ikiye katlandı, panelden takip etmek çok kolay.",
    ad: "Ali R.",
    rol: "Lastikçi · İstanbul",
  },
  {
    metin: "Araç kilit işlerim eskiden sadece tanıdıktan geliyordu. Şimdi bölgeden düzenli talep alıyorum, iş hacmim arttı.",
    ad: "Serkan D.",
    rol: "Anahtarcı · İstanbul",
  },
] as const;

type CekiciKayitLandingProps = {
  onKayitBasla: () => void;
};

export function CekiciKayitLanding({ onKayitBasla }: CekiciKayitLandingProps) {
  return (
    <div className="space-y-4 mb-6">
      <section className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50 via-white to-white px-4 py-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-2">
          Hizmet verenler için · İstanbul
        </p>
        <h1 className="text-xl font-bold text-slate-900 leading-snug">
          Çekici, lastikçi veya anahtarcı mısınız? İstanbul’daki yol yardım
          taleplerine teklif verin.
        </h1>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          Erken fazda panel kullanımı İstanbul’da açık. Diğer illerden kayıt
          olabilirsiniz; şehriniz açılınca sizi önde tutarız. Müşteri talep
          açar, size SMS + panel bildirimi gelir. Fiyat ve sürenizi yazarsınız;
          sizi seçerse telefon ve konum açılır.
        </p>

        <ul className="mt-4 space-y-2">
          {AVANTAJLAR.map((madde) => (
            <li
              key={madde}
              className="flex items-start gap-2.5 text-sm text-slate-800"
            >
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold"
                aria-hidden
              >
                ✓
              </span>
              <span className="font-medium">{madde}</span>
            </li>
          ))}
        </ul>

        <Btn type="button" className="w-full mt-5" onClick={onKayitBasla}>
          Ücretsiz çekici kaydı oluştur
        </Btn>
      </section>

      <section aria-labelledby="is-akisi-baslik">
        <h2
          id="is-akisi-baslik"
          className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 px-0.5"
        >
          İş gelince ne olur?
        </h2>
        <div className="grid gap-2">
          {IS_AKISI.map((adim) => (
            <Card
              key={adim.baslik}
              className="!py-3 !px-3.5 flex gap-3 items-start border-slate-100"
            >
              <span className="text-2xl shrink-0" aria-hidden>
                {adim.ikon}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {adim.baslik}
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {adim.aciklama}
                </p>
              </div>
            </Card>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2 px-0.5 leading-relaxed">
          Kazancınız müşteriyle anlaştığınız teklif tutarıdır; ödeme doğrudan
          müşteri ile aranızda gerçekleşir.
        </p>
      </section>

      <section aria-labelledby="guven-baslik">
        <h2
          id="guven-baslik"
          className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 px-0.5"
        >
          Güvenilir platform
        </h2>
        <Card className="!p-3.5 border-emerald-100 bg-emerald-50/40">
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-emerald-100/80">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-2xl"
              aria-hidden
            >
              🚛
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Gerçek çekiciler, gerçek işler
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Türkiye genelinde yol yardım ve çekici ağı
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            {GUVEN_MADDELERI.map((madde) => (
              <li key={madde.baslik} className="flex gap-3 items-start">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-100 text-base"
                  aria-hidden
                >
                  {madde.ikon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {madde.baslik}
                    </p>
                    {"rozet" in madde && madde.rozet && (
                      <OnayliCekiciRozeti kucuk />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {madde.aciklama}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section aria-labelledby="yorumlar-baslik">
        <h2
          id="yorumlar-baslik"
          className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2 px-0.5"
        >
          Hizmet verenlerden
        </h2>
        <div className="space-y-2">
          {YORUMLAR.map((y) => (
            <blockquote
              key={y.ad}
              className="rounded-xl border border-slate-100 bg-white px-3.5 py-3 text-sm"
            >
              <p className="text-slate-700 leading-relaxed">&ldquo;{y.metin}&rdquo;</p>
              <footer className="mt-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{y.ad}</span>
                {" · "}
                {y.rol}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    </div>
  );
}
