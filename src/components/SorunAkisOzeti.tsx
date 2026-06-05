"use client";

import { useCallback, useEffect, useState } from "react";
import { sorunAkisAciklama, type SorunAkisAdim } from "@/lib/sorun-akis-aciklama";
import { sorunTipiBul } from "@/lib/sorun-tipleri";

const ADIM_SURE_MS = 2500;

type Props = {
  sorunTipi: string;
  /** Seçili sorun kutusunun içinde — dış çerçeve ve başlık yok */
  icinde?: boolean;
};

function adimAciklamaMetni(
  sorunTipi: string,
  idx: number,
  toplam: number
): string {
  const hedefVar = toplam >= 5;
  const genel: Record<number, string> = hedefVar
    ? {
        0: "Aracınızın bulunduğu yeri girin",
        1: "Fotoğraf ve araç bilgisi (gerekirse)",
        2: "Aracın götürüleceği yeri seçin",
        3: "Yakındaki hizmet verenler teklif gönderir",
        4: "En uygun teklifi seçin, en kısa sürede gelsin",
      }
    : {
        0: "Bulunduğunuz konumu paylaşın",
        1: "Gerekirse ek detay verin",
        2: "Teklifler gelir, fiyat ve süreyi karşılaştırın",
        3: "Bir teklif seçin, hizmet yerinize gelsin",
      };

  if (sorunTipi === "lastik") {
    if (idx === 2) return "Yakındaki lastikçiler fiyat ve süre teklif eder";
    if (idx === 3) return "Lastikçi yola çıksın, yerinde tamir veya değişim";
  }
  if (sorunTipi === "aku") {
    if (idx === 2) return "Yol yardım ekipleri teklif gönderir";
    if (idx === 3) return "Takviye veya akü değişimi yerinde yapılır";
  }
  if (sorunTipi === "yakit") {
    if (idx === 2) return "Yakıt desteği verenler teklif eder";
    if (idx === 3) return "En az 1 litre yakıt getirilir";
  }
  if (sorunTipi === "kilit") {
    if (idx === 2) return "Anahtarcılar teklif gönderir";
    if (idx === 3) return "Anahtarcı gelir, kilidi açar";
  }
  if (sorunTipi === "ariza" && idx === 2) {
    return "Tamir servisi veya oto sanayi seçin";
  }
  if (sorunTipi === "kaza" && idx === 2) {
    return "Aracın çekileceği servis veya adresi seçin";
  }
  if (sorunTipi === "cekici" && idx === 2) {
    return "Aracın götürüleceği hedefi belirleyin";
  }

  return genel[idx] ?? "";
}

function SorunAkisOzetiIcerik({
  sorunTipi,
  icinde,
  hizmet,
  adimlar,
  aktifIdx,
  onAdimSec,
}: {
  sorunTipi: string;
  icinde: boolean;
  hizmet: string;
  adimlar: SorunAkisAdim[];
  aktifIdx: number;
  onAdimSec: (idx: number) => void;
}) {
  const guvenliIdx =
    adimlar.length > 0 ? Math.min(aktifIdx, adimlar.length - 1) : 0;

  return (
    <>
      <p
        className={`text-[11px] text-slate-600 leading-relaxed ${icinde ? "pt-2 border-t border-amber-200/70" : "mb-2.5"}`}
      >
        <span className="font-semibold text-slate-700">Hizmet: </span>
        {hizmet}
      </p>

      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
        Süreç
      </p>

      <div className="overflow-x-auto -mx-0.5 px-0.5 pt-1 pb-0.5">
        <div className="flex items-start min-w-0">
          {adimlar.map((adim, i) => {
            const aktif = i === guvenliIdx;
            const gecildi = i < guvenliIdx;
            return (
              <div key={`${sorunTipi}-${adim.kisa}`} className="flex items-start flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-[2.75rem]">
                  <div className="flex h-10 w-10 items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onAdimSec(i)}
                      aria-label={`${adim.kisa}: ${adimAciklamaMetni(sorunTipi, i, adimlar.length)}`}
                      aria-current={aktif ? "step" : undefined}
                      className={[
                        "relative flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-all duration-300 touch-manipulation",
                        aktif
                          ? "border-amber-500 bg-amber-100 animate-nasil-glow"
                          : gecildi
                            ? "border-amber-300 bg-white/80 hover:border-amber-400"
                            : "border-slate-200 bg-white text-slate-400 hover:border-amber-300 hover:text-slate-600",
                      ].join(" ")}
                    >
                      <span className="text-[11px]">{adim.ikon}</span>
                    </button>
                  </div>
                  <p
                    className={[
                      "mt-0.5 text-[9px] font-medium text-center leading-tight",
                      aktif ? "text-amber-900 font-semibold" : "text-slate-500",
                    ].join(" ")}
                  >
                    {adim.kisa}
                  </p>
                </div>
                {i < adimlar.length - 1 && (
                  <div
                    className="flex-1 h-px mt-[1.125rem] min-w-[0.35rem] mx-px rounded-full bg-slate-200 overflow-hidden"
                    aria-hidden
                  >
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: guvenliIdx > i ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p
        className="text-[10px] text-slate-500 text-center mt-1.5 min-h-[1.25rem]"
        aria-live="polite"
      >
        {adimlar[guvenliIdx]?.kisa} —{" "}
        {adimAciklamaMetni(sorunTipi, guvenliIdx, adimlar.length)}
      </p>
    </>
  );
}

/** Seçilen sorun tipi için küçük hizmet + süreç özeti */
export function SorunAkisOzeti({ sorunTipi, icinde = false }: Props) {
  const aciklama = sorunAkisAciklama(sorunTipi);
  const tip = sorunTipiBul(sorunTipi);
  const [aktifIdx, setAktifIdx] = useState(0);
  const [animasyonEpoch, setAnimasyonEpoch] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setAktifIdx(0);
    setAnimasyonEpoch((e) => e + 1);
  }, [sorunTipi]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const guncelle = () => setReducedMotion(mq.matches);
    guncelle();
    mq.addEventListener("change", guncelle);
    return () => mq.removeEventListener("change", guncelle);
  }, []);

  useEffect(() => {
    if (!aciklama || reducedMotion || aciklama.adimlar.length === 0) return;
    const adimSayisi = aciklama.adimlar.length;
    const id = setInterval(() => {
      setAktifIdx((i) => (i + 1) % adimSayisi);
    }, ADIM_SURE_MS);
    return () => clearInterval(id);
  }, [aciklama, reducedMotion, animasyonEpoch]);

  const adimSec = useCallback((idx: number) => {
    setAktifIdx(idx);
    setAnimasyonEpoch((e) => e + 1);
  }, []);

  if (!aciklama || !tip) return null;

  const icerikProps = {
    sorunTipi,
    icinde,
    hizmet: aciklama.hizmet,
    adimlar: aciklama.adimlar,
    aktifIdx,
    onAdimSec: adimSec,
  };

  if (icinde) {
    return (
      <div className="w-full animate-fade-in" role="region" aria-label={`${tip.label} süreci`}>
        <SorunAkisOzetiIcerik {...icerikProps} />
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-3 py-2.5 animate-fade-in"
      role="region"
      aria-label={`${tip.label} süreci`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base shrink-0" aria-hidden>
          {tip.icon}
        </span>
        <p className="text-xs font-semibold text-amber-900 leading-snug">
          {tip.label}
        </p>
      </div>

      <SorunAkisOzetiIcerik {...icerikProps} />
    </div>
  );
}
