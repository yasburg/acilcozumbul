"use client";

interface IlceSecimiProps {
  il: string;
  tumIlceler: string[];
  seciliIlceler: string[];
  onToggle: (ilce: string) => void;
  onTumunuSec: () => void;
  onTemizle: () => void;
}

export function IlceSecimi({
  il,
  tumIlceler,
  seciliIlceler,
  onToggle,
  onTumunuSec,
  onTemizle,
}: IlceSecimiProps) {
  const seciliSet = new Set(seciliIlceler);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{il}</span> —{" "}
          {seciliIlceler.length} / {tumIlceler.length} ilçe
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

      <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-1">
        {tumIlceler.map((ilce) => {
          const secili = seciliSet.has(ilce);
          return (
            <button
              key={ilce}
              type="button"
              onClick={() => onToggle(ilce)}
              className={`text-left text-sm px-3 py-2.5 rounded-xl border transition ${
                secili
                  ? "border-amber-400 bg-amber-50 text-amber-900 font-medium"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              {secili && <span className="mr-1">✓</span>}
              {ilce}
            </button>
          );
        })}
      </div>
    </div>
  );
}
