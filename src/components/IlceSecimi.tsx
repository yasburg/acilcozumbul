"use client";

import { useMemo, useState } from "react";
import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";

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
  const [ara, setAra] = useState("");
  const Check = AcbIcons.check;
  const Search = AcbIcons.search;

  const filtreliIlceler = useMemo(() => {
    const q = ara.trim().toLocaleLowerCase("tr-TR");
    if (!q) return tumIlceler;
    return tumIlceler.filter((ilce) =>
      ilce.toLocaleLowerCase("tr-TR").includes(q)
    );
  }, [ara, tumIlceler]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{il}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {seciliIlceler.length} / {tumIlceler.length} seçili
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onTumunuSec}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2 py-1 rounded-md hover:bg-emerald-50 transition"
          >
            Tümü
          </button>
          <span className="text-slate-200">|</span>
          <button
            type="button"
            onClick={onTemizle}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1 rounded-md hover:bg-slate-100 transition"
          >
            Temizle
          </button>
        </div>
      </div>

      {tumIlceler.length > 8 && (
        <div className="relative">
          <Search
            className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={ACB_ICON_STROKE}
          />
          <input
            type="search"
            value={ara}
            onChange={(e) => setAra(e.target.value)}
            placeholder="İlçe ara…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
            autoComplete="off"
          />
          {ara && (
            <button
              type="button"
              onClick={() => setAra("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
        {filtreliIlceler.length === 0 && (
          <p className="col-span-full text-xs text-slate-500 text-center py-6">
            &ldquo;{ara}&rdquo; ile eşleşen ilçe bulunamadı.
          </p>
        )}
        {filtreliIlceler.map((ilce) => {
          const secili = seciliSet.has(ilce);
          return (
            <button
              key={ilce}
              type="button"
              onClick={() => onToggle(ilce)}
              className={`flex items-center justify-between text-left text-xs sm:text-sm px-2.5 py-2.5 rounded-xl border font-medium transition-all ${
                secili
                  ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="truncate mr-1">{ilce}</span>
              {secili ? (
                <Check
                  className="size-3.5 shrink-0 text-emerald-600"
                  strokeWidth={ACB_ICON_STROKE}
                  aria-hidden
                />
              ) : (
                <span className="size-3.5 shrink-0 rounded-full border border-slate-300" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
