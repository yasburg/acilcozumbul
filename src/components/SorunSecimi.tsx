"use client";

import { SORUN_TIPLERI } from "@/lib/sorun-tipleri";
import { SorunAkisOzeti } from "@/components/SorunAkisOzeti";
import { Btn, TextArea } from "@/components/ui";
import type { ReactNode } from "react";

interface SorunSecimiProps {
  seciliTip: string;
  detay: string;
  onTipSec: (id: string) => void;
  onDetayChange: (detay: string) => void;
  /** Yalnızca sorun tipi seçimi (detay alanları gizlenir) */
  sadeceTipSecimi?: boolean;
  /** Seçili kutunun altında Devam Et */
  onDevam?: () => void;
  devamDisabled?: boolean;
  devamIcerik?: ReactNode;
  /** Devam Et üstünde gösterilecek konum özeti */
  konumAdres?: string | null;
  onAdresDuzelt?: () => void;
  /** Seçili kutunun içinde Devam üstü özel konum alanı (öncelikli) */
  konumIcerik?: ReactNode;
  /** Compact: daha alçak kartlar (müşteri landing) */
  kompaktKart?: boolean;
}

export function SorunSecimi({
  seciliTip,
  detay,
  onTipSec,
  onDetayChange,
  sadeceTipSecimi = false,
  onDevam,
  devamDisabled = false,
  devamIcerik,
  konumAdres,
  onAdresDuzelt,
  konumIcerik,
  kompaktKart = false,
}: SorunSecimiProps) {
  const kartPy = kompaktKart ? "py-2.5 px-3.5" : "py-3 px-4";
  const gap = kompaktKart ? "gap-1" : "gap-1.5";

  return (
    <div className={kompaktKart ? "space-y-2.5" : "space-y-4"}>
      <p className="text-sm font-semibold text-slate-800">Sorununuz nedir?</p>
      <div className={`grid grid-cols-1 ${gap}`}>
        {SORUN_TIPLERI.map((tip) => {
          const secili = seciliTip === tip.id;
          const seciliKutu = secili && sadeceTipSecimi;

          if (seciliKutu) {
            return (
              <div
                key={tip.id}
                data-sorun-id={tip.id}
                className="rounded-xl border border-amber-500 bg-amber-50 ring-2 ring-amber-500/25 overflow-hidden scroll-mt-24"
              >
                <button
                  type="button"
                  onClick={() => onTipSec(tip.id)}
                  className={`w-full text-left ${kartPy} flex items-center gap-2.5`}
                >
                  <span className="text-lg shrink-0">{tip.icon}</span>
                  <span className="font-medium text-sm flex-1 min-w-0 text-amber-900">
                    {tip.label}
                  </span>
                  <span className="shrink-0 text-amber-600 text-base">✓</span>
                </button>
                <div className="px-3.5 pb-2.5 pt-0 space-y-2">
                  {!kompaktKart && <SorunAkisOzeti sorunTipi={tip.id} icinde />}
                  {konumIcerik ??
                    (konumAdres?.trim() ? (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                        <p className="text-[10px] text-emerald-700 uppercase tracking-wide mb-0.5">
                          Arıza konumu (GPS)
                        </p>
                        <p className="text-sm text-emerald-900 leading-snug">
                          {konumAdres}
                        </p>
                        {onAdresDuzelt && (
                          <button
                            type="button"
                            onClick={onAdresDuzelt}
                            className="mt-1.5 text-xs text-emerald-800 underline font-medium"
                          >
                            Adresi düzelt
                          </button>
                        )}
                      </div>
                    ) : null)}
                  {onDevam && (
                    <Btn
                      type="button"
                      id="sorun-devam-et"
                      className="w-full"
                      onClick={onDevam}
                      disabled={devamDisabled}
                    >
                      {devamIcerik ?? "Devam Et"}
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
              data-sorun-id={tip.id}
              onClick={() => onTipSec(tip.id)}
              className={`w-full text-left rounded-xl border ${kartPy} transition border-slate-200 bg-white hover:border-amber-300 flex items-center gap-2.5 scroll-mt-24`}
            >
              <span className="text-lg shrink-0">{tip.icon}</span>
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
