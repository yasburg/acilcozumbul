/** Centered sliding step window — physical sliding track with 350ms spring transition. */
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
  if (total <= 0) return null;
  const cur = Math.min(Math.max(current, 1), total);
  const curIndex = cur - 1;

  // Each pill is 28px wide (w-7), gap is 6px (gap-1.5) -> total step slot = 34px
  const PILL_WIDTH = 28;
  const GAP_WIDTH = 6;
  const STEP_SLOT = PILL_WIDTH + GAP_WIDTH;

  // Visible window shows max 4 pills (1 previous, 1 active, 2 upcoming)
  const shiftCount = Math.max(0, curIndex - 1);
  const translateX = -(shiftCount * STEP_SLOT);

  return (
    <div
      className={`mx-auto w-[130px] overflow-hidden ${className}`}
      role="list"
      aria-label={`Adım ${cur} / ${total}`}
    >
      <div
        className="flex items-center gap-1.5 transition-transform duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: `translateX(${translateX}px)` }}
      >
        {Array.from({ length: total }, (_, i) => {
          const buradayiz = i === curIndex;
          const gecildi = i < curIndex;
          return (
            <button
              key={`step-bar-${i}`}
              type="button"
              role="listitem"
              onClick={() => onStepClick?.(i)}
              disabled={!onStepClick}
              className={[
                "relative h-2 w-7 shrink-0 overflow-hidden rounded-full transition-all duration-350 ease-[cubic-bezier(0.32,0.72,0,1)]",
                onStepClick ? "touch-manipulation" : "pointer-events-none",
                buradayiz
                  ? "bg-[var(--acb-green)] shadow-[0_0_12px_2px_rgba(8,155,45,0.55)] scale-105"
                  : gecildi
                    ? "bg-[var(--acb-green)] opacity-90"
                    : "bg-slate-200",
              ].join(" ")}
              aria-label={`Adım ${i + 1}`}
              aria-current={buradayiz ? "step" : undefined}
            >
              {/* Smooth animated fill layer */}
              <span
                className={`absolute inset-0 rounded-full bg-[var(--acb-green)] transition-transform duration-350 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  buradayiz || gecildi
                    ? "scale-x-100 origin-left"
                    : "scale-x-0 origin-left"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
