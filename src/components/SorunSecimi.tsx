"use client";

import { SORUN_TIPLERI } from "@/lib/sorun-tipleri";
import { SorunAkisOzeti } from "@/components/SorunAkisOzeti";
import { Btn, TextArea } from "@/components/ui";
import { AcbIcons, SorunIkon } from "@/lib/acb-icons";
import type { ReactNode } from "react";

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
  /** 2 sütunlu hızlı seçim ızgarası (acil akış) */
  izgara?: boolean;
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
  izgara = false,
}: SorunSecimiProps) {
  const kartPy = kompaktKart ? "py-3 px-3.5" : "py-3.5 px-4";
  const gap = kompaktKart ? "gap-2" : "gap-2.5";
  const altIcerikVar = !!(konumIcerik || konumAdres?.trim());
  const Check = AcbIcons.check;

  /** Sade tip seçimi: tick + soft selected surface */
  if (sadeceTipSecimi && !altIcerikVar) {
    if (izgara) {
      return (
        <div className={kompaktKart ? "space-y-2.5" : "space-y-3"}>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {SORUN_TIPLERI.map((tip) => {
              const secili = seciliTip === tip.id;
              return (
                <button
                  key={tip.id}
                  type="button"
                  data-sorun-id={tip.id}
                  onClick={() => onTipSec(tip.id)}
                  aria-pressed={secili}
                  className={`flex min-h-[5.25rem] flex-col items-center justify-center gap-2 rounded-[var(--acb-radius-lg)] border px-2 py-3.5 text-center touch-manipulation transition scroll-mt-24 active:scale-[0.98] ${
                    secili
                      ? "border-[var(--acb-green)] bg-[var(--acb-soft)]"
                      : "border-[var(--acb-border)] bg-white hover:border-[color-mix(in_srgb,var(--acb-green)_40%,white)]"
                  }`}
                >
                  <SorunIkon id={tip.id} className="size-7" active={secili} />
                  <span
                    className={`text-[13px] font-semibold leading-tight ${
                      secili ? "text-[var(--acb-dark)]" : "text-slate-800"
                    }`}
                  >
                    {tip.shortLabel ?? tip.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className={kompaktKart ? "space-y-2.5" : "space-y-4"}>
        <div className={`grid grid-cols-1 ${gap}`}>
          {SORUN_TIPLERI.map((tip) => {
            const secili = seciliTip === tip.id;
            return (
              <button
                key={tip.id}
                type="button"
                data-sorun-id={tip.id}
                onClick={() => onTipSec(tip.id)}
                aria-pressed={secili}
                className={`w-full text-left rounded-[var(--acb-radius)] border ${kartPy} transition touch-manipulation flex items-center gap-3 scroll-mt-24 ${
                  secili
                    ? "border-[var(--acb-green)] bg-[var(--acb-soft)]"
                    : "border-[var(--acb-border)] bg-white hover:border-[color-mix(in_srgb,var(--acb-green)_40%,white)]"
                }`}
              >
                <SorunIkon id={tip.id} className="size-5 shrink-0" active={secili} />
                <span
                  className={`font-medium text-sm flex-1 min-w-0 ${
                    secili ? "text-[var(--acb-dark)]" : "text-slate-800"
                  }`}
                >
                  {tip.label}
                </span>
                {secili ? (
                  <Check
                    className="size-5 shrink-0 text-[var(--acb-green)]"
                    strokeWidth={1.75}
                    aria-hidden
                  />
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
      <div className={`grid grid-cols-1 ${gap}`}>
        {SORUN_TIPLERI.map((tip) => {
          const secili = seciliTip === tip.id;
          const seciliKutu = secili && sadeceTipSecimi;

          if (seciliKutu) {
            return (
              <div
                key={tip.id}
                data-sorun-id={tip.id}
                className={`rounded-[var(--acb-radius)] border overflow-hidden scroll-mt-24 border-[var(--acb-green)] bg-[var(--acb-soft)]`}
              >
                <button
                  type="button"
                  onClick={() => onTipSec(tip.id)}
                  className={`w-full text-left ${kartPy} flex items-center gap-3`}
                >
                  <SorunIkon id={tip.id} className="size-5 shrink-0" active />
                  <span className="font-medium text-sm flex-1 min-w-0 text-[var(--acb-dark)]">
                    {tip.label}
                  </span>
                  <Check
                    className="size-5 shrink-0 text-[var(--acb-green)]"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </button>
                <div className="px-3.5 pb-2.5 pt-0 space-y-2">
                  {konumIcerik ??
                    (konumAdres?.trim() ? (
                      <div className="rounded-[var(--acb-radius-sm)] border border-[var(--acb-border)] bg-white px-3 py-2.5">
                        <p className="text-[10px] text-[var(--acb-muted)] uppercase tracking-wide mb-0.5">
                          Arıza konumu
                        </p>
                        <p className="text-sm text-[var(--acb-dark)] leading-snug">
                          {konumAdres}
                        </p>
                        {onAdresDuzelt && (
                          <button
                            type="button"
                            onClick={onAdresDuzelt}
                            className="mt-1.5 text-xs text-[var(--acb-dark)] underline font-medium"
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
              className={`w-full text-left rounded-[var(--acb-radius)] border ${kartPy} transition flex items-center gap-3 scroll-mt-24 ${
                secili
                  ? "border-[var(--acb-green)] bg-[var(--acb-soft)]"
                  : "border-[var(--acb-border)] bg-white hover:border-[color-mix(in_srgb,var(--acb-green)_40%,white)]"
              }`}
            >
              <SorunIkon id={tip.id} className="size-5 shrink-0" active={secili} />
              <span
                className={`font-medium text-sm flex-1 min-w-0 ${
                  secili ? "text-[var(--acb-dark)]" : "text-slate-800"
                }`}
              >
                {tip.label}
              </span>
              {secili ? (
                <Check
                  className="size-5 shrink-0 text-[var(--acb-green)]"
                  strokeWidth={1.75}
                  aria-hidden
                />
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
