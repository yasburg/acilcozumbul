"use client";

import { useEffect, useState } from "react";

const EASE = "cubic-bezier(0.32,0.72,0,1)";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Premium step indicator — a row of small segments, no numbers or step
 * counts. Progress reads purely through color: filled up to the current
 * step, with the active segment brighter and slightly wider. Advancing
 * or going back just animates that color/width shift.
 *
 * Rendered as its own floating glass pill, separate from the solid
 * background of the Geri/Devam button bar beneath it.
 */
export function FlowProgress({
  current,
  total,
  onStepClick,
  className = "",
}: {
  current: number;
  total: number;
  /** 0-based step index */
  onStepClick?: (index: number) => void;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  if (total <= 0) return null;
  const cur = Math.min(Math.max(current, 1), total);
  const curIndex = cur - 1;
  const transition = reducedMotion
    ? "none"
    : `width 320ms ${EASE}, background-color 320ms ${EASE}, opacity 320ms ${EASE}, box-shadow 320ms ${EASE}`;

  return (
    <div className={`mx-auto flex w-fit justify-center ${className}`}>
      <div
        className="flex items-center gap-[6px] rounded-full border border-slate-200/90 bg-white/95 px-3.5 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.14),0_2px_6px_rgba(0,0,0,0.06)] backdrop-blur-md transition-all duration-200"
        role="list"
        aria-label={`Adım ${cur} / ${total}`}
      >
        {Array.from({ length: total }, (_, i) => {
          const isCurrent = i === curIndex;
          const isPast = i < curIndex;
          return (
            <button
              key={`flow-step-${i}`}
              type="button"
              role="listitem"
              onClick={() => onStepClick?.(i)}
              disabled={!onStepClick}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`Adım ${i + 1}`}
              className={`flex items-center justify-center p-0.5 ${
                onStepClick ? "touch-manipulation" : "pointer-events-none"
              }`}
            >
              <span
                className="block h-[5px] rounded-full"
                style={{
                  width: isCurrent ? 20 : 9,
                  backgroundColor:
                    isCurrent || isPast
                      ? "var(--acb-green)"
                      : "color-mix(in srgb, var(--acb-dark) 12%, white)",
                  opacity: isPast ? 0.7 : 1,
                  boxShadow: isCurrent
                    ? "0 0 8px 1px rgba(8,155,45,0.55)"
                    : "none",
                  transition,
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
