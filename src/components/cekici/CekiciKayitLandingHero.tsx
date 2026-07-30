"use client";

import { Btn } from "@/components/ui";

const AVANTAJLAR = [
  "Kayıt ücretsiz",
  "Teklif vermek ücretsiz",
  "İstanbul ilçe bazlı çalış",
] as const;

type Props = {
  onKayitBasla: () => void;
  /** Varsayılan: Ücretsiz çekici kaydı oluştur */
  ctaMetin?: string;
};

/** A ekranındaki üst değer önerisi kartı (kontenjan kartının altı) */
export function CekiciKayitLandingHero({
  onKayitBasla,
  ctaMetin = "Ücretsiz çekici kaydı oluştur",
}: Props) {
  return (
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
        olabilirsiniz; şehriniz açılınca sizi önde tutarız. Müşteri talep açar,
        size SMS + panel bildirimi gelir. Fiyat ve sürenizi yazarsınız; sizi
        seçerse telefon ve konum açılır.
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
        {ctaMetin}
      </Btn>
    </section>
  );
}
