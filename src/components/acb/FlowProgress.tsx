/** Subtle step indicator — never competes with the question. */
export function FlowProgress({
  current,
  total,
  className = "",
}: {
  current: number;
  total: number;
  className?: string;
}) {
  if (total <= 0) return null;
  const cur = Math.min(Math.max(current, 1), total);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className={`inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide text-[var(--acb-muted)] ${className}`}
      aria-label={`Adım ${cur} / ${total}`}
    >
      <span className="tabular-nums text-[var(--acb-dark)]">
        {pad(cur)}
      </span>
      <span className="text-[var(--acb-border)]" aria-hidden>
        /
      </span>
      <span className="tabular-nums">{pad(total)}</span>
      <span
        className="ml-1 h-1 w-16 overflow-hidden rounded-full bg-[var(--acb-border)]"
        aria-hidden
      >
        <span
          className="block h-full rounded-full bg-[var(--acb-green)] transition-[width] duration-300 ease-out"
          style={{ width: `${(cur / total) * 100}%` }}
        />
      </span>
    </div>
  );
}
