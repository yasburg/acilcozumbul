"use client";

import { SORUN_TIPLERI } from "@/lib/sorun-tipleri";
import { SorunAkisOzeti } from "@/components/SorunAkisOzeti";
import { Btn, TextArea } from "@/components/ui";

interface SorunSecimiProps {
  seciliTip: string;
  detay: string;
  onTipSec: (id: string) => void;
  onDetayChange: (detay: string) => void;
  /** Yalnızca sorun tipi seçimi (detay alanları gizlenir) */
  sadeceTipSecimi?: boolean;
  /** İlk adım — seçili kutunun içinde Devam Et */
  onDevam?: () => void;
}

export function SorunSecimi({
  seciliTip,
  detay,
  onTipSec,
  onDetayChange,
  sadeceTipSecimi = false,
  onDevam,
}: SorunSecimiProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-slate-700">Sorununuz nedir?</p>
      <div className="grid grid-cols-1 gap-2">
        {SORUN_TIPLERI.map((tip) => {
          const secili = seciliTip === tip.id;
          const seciliKutu = secili && sadeceTipSecimi;

          if (seciliKutu) {
            return (
              <div
                key={tip.id}
                className="rounded-xl border border-amber-500 bg-amber-50 ring-2 ring-amber-500/30 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => onTipSec(tip.id)}
                  className="w-full text-left px-4 py-3.5 flex items-center gap-3"
                >
                  <span className="text-xl shrink-0">{tip.icon}</span>
                  <span className="font-medium text-sm flex-1 min-w-0 text-amber-900">
                    {tip.label}
                  </span>
                  <span className="shrink-0 text-amber-600 text-lg">✓</span>
                </button>
                <div className="px-4 pb-4">
                  <SorunAkisOzeti sorunTipi={tip.id} icinde />
                  {onDevam && (
                    <Btn type="button" className="w-full mt-3" onClick={onDevam}>
                      Devam Et
                    </Btn>
                  )}
                </div>
              </div>
            );
          }

          return (
            <button
              key={tip.id}
              type="button"
              onClick={() => onTipSec(tip.id)}
              className="w-full text-left rounded-xl border px-4 py-3.5 transition border-slate-200 bg-white hover:border-amber-300 flex items-center gap-3"
            >
              <span className="text-xl shrink-0">{tip.icon}</span>
              <span className="font-medium text-sm flex-1 min-w-0 text-slate-800">
                {tip.label}
              </span>
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
