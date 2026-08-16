"use client";

import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";

interface YildizPuaniProps {
  label: string;
  aciklama?: string;
  value: number;
  onChange: (n: number) => void;
}

export function YildizPuani({ label, aciklama, value, onChange }: YildizPuaniProps) {
  return (
    <div className="rounded-[var(--acb-radius-lg)] border border-[var(--acb-border)] bg-white px-4 py-3.5 shadow-[var(--acb-shadow)]">
      <p className="text-sm font-medium text-[var(--acb-dark)]">{label}</p>
      {aciklama && (
        <p className="text-xs text-[var(--acb-muted)] mt-0.5 leading-relaxed">{aciklama}</p>
      )}
      <div className="flex justify-center gap-1.5 mt-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`min-h-[var(--acb-touch)] min-w-[var(--acb-touch)] flex items-center justify-center transition-transform touch-manipulation active:scale-90 ${
              value >= n ? "scale-110" : ""
            }`}
            aria-label={`${n} yıldız`}
            aria-pressed={value >= n}
          >
            <AcbIcons.rating
              className={value >= n ? "size-7 fill-current text-[var(--acb-dark)]" : "size-7 text-[var(--acb-border)]"}
              strokeWidth={ACB_ICON_STROKE}
              aria-hidden
            />
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-[var(--acb-muted)] mt-2">
        {value > 0 ? `${value} / 5` : "Seçin"}
      </p>
    </div>
  );
}
