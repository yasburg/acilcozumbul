"use client";

import type { SorunTipi } from "@/lib/sorun-tipleri";
import { AcbIcons, ACB_ICON_STROKE, SorunIkon } from "@/lib/acb-icons";

interface SorunTipiSecimiProps {
  tumTipler: SorunTipi[];
  seciliTipler: string[];
  onToggle: (id: string) => void;
  onTumunuSec: () => void;
  onTemizle: () => void;
}

export function SorunTipiSecimi({
  tumTipler,
  seciliTipler,
  onToggle,
  onTumunuSec,
  onTemizle,
}: SorunTipiSecimiProps) {
  const seciliSet = new Set(seciliTipler);
  const Check = AcbIcons.check;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Sorun Tipleri
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {seciliTipler.length} / {tumTipler.length} seçili
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onTumunuSec}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2 py-1 rounded-md hover:bg-emerald-50 transition"
          >
            Tümü
          </button>
          <span className="text-slate-200">|</span>
          <button
            type="button"
            onClick={onTemizle}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded-md hover:bg-slate-100 transition"
          >
            Temizle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {tumTipler.map((tip) => {
          const secili = seciliSet.has(tip.id);
          return (
            <button
              key={tip.id}
              type="button"
              onClick={() => onToggle(tip.id)}
              className={`flex items-center gap-3 text-left text-xs sm:text-sm px-3.5 py-3 rounded-2xl border transition-all ${
                secili
                  ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div
                className={`size-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  secili
                    ? "bg-emerald-100/90 text-emerald-700 border border-emerald-300/60"
                    : "bg-slate-100 text-slate-600 border border-slate-200/60"
                }`}
              >
                <SorunIkon
                  id={tip.id}
                  className={`size-5 ${secili ? "text-emerald-700" : "text-slate-600"}`}
                  active={secili}
                />
              </div>
              <span className="flex-1 leading-snug">{tip.label}</span>
              <div
                className={`size-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                  secili
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {secili && (
                  <Check
                    className="size-3 text-white"
                    strokeWidth={ACB_ICON_STROKE * 1.2}
                    aria-hidden
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
