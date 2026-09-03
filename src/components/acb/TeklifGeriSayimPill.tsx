"use client";

import { useEffect, useState, useRef } from "react";

interface TeklifGeriSayimPillProps {
  step: string;
  progressCurrent: number;
  progressTotal: number;
  className?: string;
}

/**
 * Saniyeyi kesintisiz, anlaşılır Türkçe süre formatına çevirir:
 * Örn: 120s -> "2 dk", 90s -> "1 dk 30 sn", 45s -> "45 sn"
 */
function formatKalanSure(saniye: number): string {
  if (saniye <= 0) return "0 sn";
  const dk = Math.floor(saniye / 60);
  const sn = saniye % 60;

  if (dk > 0) {
    return sn > 0 ? `${dk} dk ${sn} sn` : `${dk} dk`;
  }
  return `${sn} sn`;
}

/**
 * Adım ilerledikçe 2 dk (120 sn)'den 0'a doğru azalan hedef süre:
 * 1. Adım: 120s (2 dk)
 * Son Adım: 0s
 */
function hesaplaHedefSaniye(progressCurrent: number, progressTotal: number): number {
  if (progressTotal <= 1 || progressCurrent >= progressTotal) {
    return 0;
  }
  const ratio = (progressTotal - progressCurrent) / Math.max(1, progressTotal - 1);
  return Math.max(0, Math.round(ratio * 120));
}

export function TeklifGeriSayimPill({
  step,
  progressCurrent,
  progressTotal,
  className = "",
}: TeklifGeriSayimPillProps) {
  const hedefSec = hesaplaHedefSaniye(progressCurrent, progressTotal);
  const [pulse, setPulse] = useState(false);
  const prevStepRef = useRef(step);

  // Adım değiştiğinde yumuşak animasyon tetikle
  useEffect(() => {
    if (prevStepRef.current !== step) {
      prevStepRef.current = step;
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(t);
    }
  }, [step]);

  const sonAdim = hedefSec <= 0 || progressCurrent >= progressTotal;
  const sureMetni = formatKalanSure(hedefSec);

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-[#eefaf2] px-2.5 py-1 text-xs font-semibold text-[#0b4e1e] shadow-[0_1px_4px_rgba(8,155,45,0.12)] transition-all duration-300 ${
        pulse ? "scale-105 bg-[#ddf6e4] border-emerald-400" : ""
      } ${className}`}
      title={
        sonAdim
          ? "Talebiniz tamamlanmak üzere · Teklifiniz az sonra sizinle!"
          : `İlk teklifinize ~${sureMetni} kaldı`
      }
      role="status"
      aria-live="polite"
    >
      {/* Canlı yeşil radar sinyali */}
      <span className="relative flex size-2 shrink-0 items-center justify-center" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
      </span>

      {/* Geri sayım / Son adım tamamlama metni */}
      {sonAdim ? (
        <div className="flex items-center gap-1 leading-none truncate tracking-tight text-[11.5px] xs:text-xs">
          <span className="font-extrabold text-emerald-800">
            Teklifin az sonra seninle
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1 leading-none truncate tracking-tight text-[11.5px] xs:text-xs">
          <span className="text-slate-600 font-medium">İlk teklifine</span>
          <span className="tabular-nums font-extrabold text-emerald-700 bg-emerald-100/60 px-1 py-0.5 rounded">
            {sureMetni}
          </span>
        </div>
      )}
    </div>
  );
}


