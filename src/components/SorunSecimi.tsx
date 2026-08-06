"use client";

import { SORUN_TIPLERI } from "@/lib/sorun-tipleri";
import { SorunAkisOzeti } from "@/components/SorunAkisOzeti";
import { Btn, TextArea } from "@/components/ui";
import type { ReactNode } from "react";

const GLOW_SECILI =
  "border-amber-400 bg-amber-50 ring-2 ring-amber-300/80 shadow-[0_0_14px_3px_rgba(245,158,11,0.55)]";
const GLOW_SECIMSIZ =
  "border-amber-300/70 bg-white ring-1 ring-amber-200/60 shadow-[0_0_12px_2px_rgba(245,158,11,0.28)] hover:border-amber-400 hover:shadow-[0_0_14px_3px_rgba(245,158,11,0.4)]";
const KUTU_NORMAL =
  "border-slate-200 bg-white hover:border-amber-300";

interface SorunSecimiProps {
  seciliTip: string;
  detay: string;
  onTipSec: (id: string) => void;
  onDetayChange: (detay: string) => void;
  /** Yalnızca sorun tipi seçimi (detay alanları + akış özeti gizlenir) */
  sadeceTipSecimi?: boolean;
  /** Seçili kutunun altında / sağında Devam Et (eski yerleşim; sticky nav tercih edilir) */
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
  const altIcerikVar = !!(konumIcerik || konumAdres?.trim());

  /** Sade tip seçimi: tick + glow, akış özeti yok */
  if (sadeceTipSecimi && !altIcerikVar) {
    return (
      <div className={kompaktKart ? "space-y-2.5" : "space-y-4"}>
        <p className="text-sm font-semibold text-slate-800">Sorununuz nedir?</p>
        <div className={`grid grid-cols-1 ${gap}`}>
          {SORUN_TIPLERI.map((tip) => {
            const secili = seciliTip === tip.id;
            const birSecimVar = Boolean(seciliTip);
            return (
              <button
                key={tip.id}
                type="button"
                data-sorun-id={tip.id}
                onClick={() => onTipSec(tip.id)}
                aria-pressed={secili}
                className={`w-full text-left rounded-xl border ${kartPy} transition touch-manipulation flex items-center gap-2.5 scroll-mt-24 ${
                  secili
                    ? GLOW_SECILI
                    : birSecimVar
                      ? KUTU_NORMAL
                      : GLOW_SECIMSIZ
                }`}
              >
                <span className="text-lg shrink-0">{tip.icon}</span>
                <span
                  className={`font-medium text-sm flex-1 min-w-0 ${
                    secili ? "text-amber-900" : "text-slate-800"
                  }`}
                >
                  {tip.label}
                </span>
                {secili ? (
                  <span className="shrink-0 text-amber-600 text-base" aria-hidden>
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

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
                className={`rounded-xl border overflow-hidden scroll-mt-24 ${GLOW_SECILI}`}
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
              className={`w-full text-left rounded-xl border ${kartPy} transition flex items-center gap-2.5 scroll-mt-24 ${
                secili
                  ? GLOW_SECILI
                  : "border-slate-200 bg-white hover:border-amber-300"
              }`}
            >
              <span className="text-lg shrink-0">{tip.icon}</span>
              <span
                className={`font-medium text-sm flex-1 min-w-0 ${
                  secili ? "text-amber-900" : "text-slate-800"
                }`}
              >
                {tip.label}
              </span>
              {secili ? (
                <span className="shrink-0 text-amber-600 text-base">✓</span>
              ) : null}
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
        <>
          {!kompaktKart && seciliTip ? (
            <SorunAkisOzeti sorunTipi={seciliTip} />
          ) : null}
          <TextArea
            label="Ek detay (isteğe bağlı)"
            placeholder="Örn: Otoyol km 42, sağ şeritteyim"
            value={detay}
            onChange={(e) => onDetayChange(e.target.value)}
            rows={2}
          />
        </>
      )}
    </div>
  );
}
