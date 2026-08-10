"use client";

import {
  SORUN_TIPLERI,
  type SorunTipiId,
} from "@/lib/sorun-tipleri";
import { SorunIkon } from "@/lib/acb-icons";

/** Premium service grid — short labels, Lucide icons, no emojis */
const GRID_ORDER: SorunTipiId[] = [
  "cekici",
  "aku",
  "lastik",
  "kilit",
  "yakit",
  "arac-tasima",
];

export function ServiceCategoryGrid({
  onSelect,
  seciliTip,
  className = "",
  title = "Nasıl yardımcı olalım?",
  showTitle = true,
}: {
  onSelect: (id: SorunTipiId) => void;
  seciliTip?: string;
  className?: string;
  title?: string;
  showTitle?: boolean;
}) {
  const items = GRID_ORDER.map((id) => {
    const tip = SORUN_TIPLERI.find((t) => t.id === id);
    return tip
      ? { ...tip, short: tip.shortLabel ?? tip.label }
      : null;
  }).filter(Boolean) as Array<{
    id: SorunTipiId;
    label: string;
    short: string;
  }>;

  return (
    <div className={className}>
      {showTitle ? (
        <p className="mb-3 text-sm font-semibold text-[var(--acb-dark)]">
          {title}
        </p>
      ) : null}
      <div
        className="grid grid-cols-3 gap-2.5"
        role="listbox"
        aria-label="Hizmet türü"
      >
        {items.map((tip) => {
          const secili = seciliTip === tip.id;
          return (
            <button
              key={tip.id}
              type="button"
              role="option"
              aria-selected={secili}
              aria-label={tip.label}
              onClick={() => onSelect(tip.id)}
              className={`flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-[var(--acb-radius-lg)] border px-2 py-3.5 text-center touch-manipulation transition-[border-color,background-color,transform,box-shadow] duration-[var(--acb-transition)] ease-out active:scale-[0.97] ${
                secili
                  ? "border-[var(--acb-green)] bg-[var(--acb-soft)] shadow-[var(--acb-shadow)]"
                  : "border-[var(--acb-border)] bg-white hover:border-[color-mix(in_srgb,var(--acb-green)_40%,white)]"
              }`}
            >
              <SorunIkon id={tip.id} className="size-7" active={secili} />
              <span
                className={`text-[12px] font-semibold leading-tight sm:text-[13px] ${
                  secili ? "text-[var(--acb-dark)]" : "text-slate-700"
                }`}
              >
                {tip.short}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
