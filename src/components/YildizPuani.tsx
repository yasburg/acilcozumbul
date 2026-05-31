"use client";

interface YildizPuaniProps {
  label: string;
  aciklama?: string;
  value: number;
  onChange: (n: number) => void;
}

export function YildizPuani({ label, aciklama, value, onChange }: YildizPuaniProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-sm font-medium text-slate-900">{label}</p>
      {aciklama && (
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{aciklama}</p>
      )}
      <div className="flex justify-center gap-2 mt-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`text-3xl transition-transform touch-manipulation ${
              value >= n ? "scale-110" : "opacity-35 grayscale"
            }`}
            aria-label={`${n} yıldız`}
          >
            ⭐
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-slate-500 mt-2">
        {value > 0 ? `${value} / 5` : "Seçin"}
      </p>
    </div>
  );
}
