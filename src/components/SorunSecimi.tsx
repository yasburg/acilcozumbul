"use client";

import { SORUN_TIPLERI } from "@/lib/sorun-tipleri";
import { TextArea } from "@/components/ui";

interface SorunSecimiProps {
  seciliTip: string;
  detay: string;
  onTipSec: (id: string) => void;
  onDetayChange: (detay: string) => void;
  /** Yalnızca sorun tipi seçimi (detay alanları gizlenir) */
  sadeceTipSecimi?: boolean;
}

export function SorunSecimi({
  seciliTip,
  detay,
  onTipSec,
  onDetayChange,
  sadeceTipSecimi = false,
}: SorunSecimiProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-slate-700">Sorununuz nedir?</p>
      <div className="grid grid-cols-1 gap-2">
        {SORUN_TIPLERI.map((tip) => {
          const secili = seciliTip === tip.id;
          return (
            <button
              key={tip.id}
              type="button"
              onClick={() => onTipSec(tip.id)}
              className={`w-full text-left rounded-xl border px-4 py-3.5 transition flex items-center gap-3 ${
                secili
                  ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500/30"
                  : "border-slate-200 bg-white hover:border-amber-300"
              }`}
            >
              <span className="text-xl shrink-0">{tip.icon}</span>
              <span
                className={`font-medium text-sm ${
                  secili ? "text-amber-900" : "text-slate-800"
                }`}
              >
                {tip.label}
              </span>
              {secili && (
                <span className="ml-auto text-amber-600 text-lg">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {!sadeceTipSecimi && seciliTip === "diger" && (
        <TextArea
          label="Açıklama"
          placeholder="Sorununuzu kısaca yazın…"
          value={detay}
          onChange={(e) => onDetayChange(e.target.value)}
          autoFocus
        />
      )}

      {!sadeceTipSecimi && seciliTip && seciliTip !== "diger" && (
        <TextArea
          label="Ek detay (isteğe bağlı)"
          placeholder="Örn: Otoyol km 42, sağ şeritteyim"
          value={detay}
          onChange={(e) => onDetayChange(e.target.value)}
          rows={2}
        />
      )}
    </div>
  );
}
