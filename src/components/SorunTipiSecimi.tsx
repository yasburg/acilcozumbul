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
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">
            {seciliTipler.length}
          </span>{" "}
          / {tumTipler.length} sorun tipi
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onTumunuSec}
            className="text-xs text-amber-700 font-medium"
          >
            Tümü
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={onTemizle}
            className="text-xs text-slate-500 font-medium"
          >
            Temizle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {tumTipler.map((tip) => {
          const secili = seciliSet.has(tip.id);
          return (
            <button
              key={tip.id}
              type="button"
              onClick={() => onToggle(tip.id)}
              className={`flex items-center gap-3 text-left text-sm px-3 py-3 rounded-xl border transition ${
                secili
                  ? "border-[var(--acb-green)] bg-[var(--acb-soft)] text-[var(--acb-dark)] font-medium"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <SorunIkon id={tip.id} className="size-5 shrink-0" active={secili} />
              <span className="flex-1 leading-snug">{tip.label}</span>
              {secili ? (
                <Check
                  className="size-4 shrink-0 text-[var(--acb-green)]"
                  strokeWidth={ACB_ICON_STROKE}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
