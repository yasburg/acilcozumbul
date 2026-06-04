/** Onaylı çekici rozeti — müşteri teklif listesinde ve hesapta */
export function OnayliCekiciRozeti({
  kucuk = false,
  className = "",
}: {
  kucuk?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border ${
        kucuk
          ? "bg-emerald-100 text-emerald-800 border-emerald-200 px-2 py-0.5 text-[10px]"
          : "bg-emerald-100 text-emerald-800 border-emerald-300 px-2.5 py-1 text-xs"
      } ${className}`}
      title="Belgesi doğrulanmış onaylı çekici"
    >
      <span
        className={`inline-flex items-center justify-center rounded-full bg-emerald-600 text-white ${
          kucuk ? "size-3.5 text-[8px]" : "size-4 text-[10px]"
        }`}
        aria-hidden
      >
        ✓
      </span>
      Doğrulanmış
    </span>
  );
}
