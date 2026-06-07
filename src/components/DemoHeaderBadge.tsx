/** Header’da demo oturumu göstergesi (yalnızca ikon, metin yok) */
export function DemoHeaderBadge() {
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-[13px] leading-none ring-1 ring-amber-300/70 shadow-sm"
      title="Demo modu"
      aria-label="Demo modu"
    >
      🎬
    </span>
  );
}
