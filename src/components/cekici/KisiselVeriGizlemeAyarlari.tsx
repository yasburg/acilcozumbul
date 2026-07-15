"use client";

import { Card } from "@/components/ui";
import { useKisiselVeriGizle } from "@/hooks/useKisiselVeriGizle";

/** Ekranda ad, soyad ve telefonu gizler (ekran paylaşımı / demo için). */
export function KisiselVeriGizlemeAyarlari() {
  const { gizli, ayarla } = useKisiselVeriGizle();

  return (
    <section>
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
        Gizlilik
      </h2>
      <Card
        className={
          gizli ? "border-violet-200 bg-violet-50/40" : "border-slate-200"
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              Kişisel verileri gizle
            </p>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              Açıkken ad, soyad, telefon ve adres tamamen gizlenir. Demo /
              video modunda yarı maske otomatik uygulanır; bu anahtar daha
              sert gizleme içindir.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={gizli}
            aria-label="Kişisel verileri gizle"
            onClick={() => ayarla(!gizli)}
            className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${
              gizli ? "bg-violet-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                gizli ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        {gizli && (
          <p className="text-xs font-medium text-violet-800 mt-3" role="status">
            Gizleme açık — ad, soyad, telefon ve adres maskeleniyor.
          </p>
        )}
      </Card>
    </section>
  );
}
