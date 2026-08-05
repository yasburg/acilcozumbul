"use client";

import {
  IHALE_OZEL_MAX_GUN,
  IHALE_OZEL_MIN_DK,
  ihaleDatetimeLocal,
  type IhaleSureTipi,
} from "@/lib/ihale";

const SECENEKLER: { id: IhaleSureTipi; label: string; aciklama: string }[] = [
  { id: "acil", label: "Acil", aciklama: "1 saat" },
  { id: "1_gun", label: "1 Gün", aciklama: "24 saat" },
  { id: "1_hafta", label: "1 Hafta", aciklama: "7 gün" },
  { id: "ozel", label: "Özel", aciklama: "Tarih seç" },
];

function sinirlar(simdi = new Date()) {
  const min = new Date(simdi.getTime() + IHALE_OZEL_MIN_DK * 60 * 1000);
  const max = new Date(
    simdi.getTime() + IHALE_OZEL_MAX_GUN * 24 * 60 * 60 * 1000
  );
  return {
    min: ihaleDatetimeLocal(min),
    max: ihaleDatetimeLocal(max),
  };
}

export function IhaleSureSecimi({
  value,
  ozelBitis,
  onChange,
  invalid = false,
}: {
  value: IhaleSureTipi;
  ozelBitis: string;
  onChange: (tip: IhaleSureTipi, ozelBitis: string) => void;
  invalid?: boolean;
}) {
  const { min, max } = sinirlar();

  return (
    <div className="space-y-2">
      <p
        className={`text-sm font-semibold ${invalid ? "text-red-700" : "text-slate-800"}`}
      >
        İhale süresi
      </p>
      <p className="text-xs text-slate-500 leading-relaxed">
        Tekliflerin ne kadar süre toplanacağını seçin. Varsayılan acil (1 saat).
      </p>
      <div
        className="grid grid-cols-2 gap-2"
        role="radiogroup"
        aria-label="İhale süresi"
      >
        {SECENEKLER.map((s) => {
          const secili = value === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={secili}
              onClick={() => {
                if (s.id === "ozel" && !ozelBitis) {
                  onChange("ozel", min);
                } else {
                  onChange(s.id, ozelBitis);
                }
              }}
              className={`rounded-xl border px-3 py-2.5 text-left touch-manipulation transition ${
                secili
                  ? "border-amber-500 bg-amber-50 ring-2 ring-amber-200"
                  : invalid
                    ? "border-red-300 bg-white"
                    : "border-slate-200 bg-white hover:border-amber-400"
              }`}
            >
              <span className="block text-sm font-semibold text-slate-900">
                {s.label}
              </span>
              <span className="block text-xs text-slate-500 mt-0.5">
                {s.aciklama}
              </span>
            </button>
          );
        })}
      </div>
      {value === "ozel" && (
        <label className="block space-y-1.5 pt-1">
          <span className="text-sm font-medium text-slate-700">
            Bitiş tarihi ve saati
          </span>
          <input
            type="datetime-local"
            value={ozelBitis || min}
            min={min}
            max={max}
            onChange={(e) => onChange("ozel", e.target.value)}
            className={`w-full rounded-xl bg-white border px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 ${
              invalid
                ? "border-red-500 ring-red-500/30 focus:ring-red-500/40"
                : "border-slate-200 focus:ring-amber-500/40 focus:border-amber-500"
            }`}
          />
          <span className="text-xs text-slate-500">
            En fazla {IHALE_OZEL_MAX_GUN} gün sonrası
          </span>
        </label>
      )}
    </div>
  );
}
