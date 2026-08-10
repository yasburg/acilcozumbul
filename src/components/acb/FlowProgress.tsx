/** Centered step segments — one bar per step (main-style). */
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

  return (
    <div
      className={`mx-auto flex w-full max-w-[11.5rem] gap-1 sm:max-w-[12.5rem] ${className}`}
      role="list"
      aria-label={`Adım ${cur} / ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const buradayiz = i === cur - 1;
        const gecildi = i < cur - 1;
        return (
          <button
            key={i}
            type="button"
            role="listitem"
            onClick={() => onStepClick?.(i)}
            disabled={!onStepClick}
            className={[
              "h-1.5 flex-1 rounded-full transition-[background-color,box-shadow] duration-[var(--acb-transition)] ease-out",
              onStepClick ? "touch-manipulation" : "pointer-events-none",
              buradayiz
                ? "bg-[var(--acb-green)] shadow-[0_0_10px_2px_rgba(8,155,45,0.45)] animate-pulse"
                : gecildi
                  ? "bg-[var(--acb-green)]"
                  : "bg-[var(--acb-border)]",
            ].join(" ")}
            aria-label={`Adım ${i + 1}`}
            aria-current={buradayiz ? "step" : undefined}
          />
        );
      })}
    </div>
  );
}
