"use client";

import { useEffect, useRef, useState } from "react";
import {
  hizmetVerenSatirBul,
  type HizmetVerenSayimOzet,
} from "@/lib/hizmet-veren-sayim";
import { gecerliSorunTipi } from "@/lib/sorun-tipleri";

function useAnimatedNumber(hedef: number, sureMs = 450): number {
  const [gorunen, setGorunen] = useState(hedef);
  const onceki = useRef(hedef);

  useEffect(() => {
    if (onceki.current === hedef) return;
    const baslangic = onceki.current;
    const baslangicZamani = performance.now();
    let frame = 0;

    const adim = (simdi: number) => {
      const t = Math.min(1, (simdi - baslangicZamani) / sureMs);
      const yumusak = 1 - Math.pow(1 - t, 3);
      setGorunen(Math.round(baslangic + (hedef - baslangic) * yumusak));
      if (t < 1) frame = requestAnimationFrame(adim);
      else onceki.current = hedef;
    };

    frame = requestAnimationFrame(adim);
    return () => cancelAnimationFrame(frame);
  }, [hedef, sureMs]);

  return gorunen;
}

function CevrimiciNokta() {
  return (
    <span className="relative inline-flex h-2 w-2 shrink-0" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  );
}

interface HizmetVerenSayimGostergesiProps {
  ozet: HizmetVerenSayimOzet | null;
  yukleniyor?: boolean;
  /** Seçili hizmet tipi — yoksa tüm platform özeti */
  sorunTipi?: string | null;
}

export function HizmetVerenSayimGostergesi({
  ozet,
  yukleniyor,
  sorunTipi,
}: HizmetVerenSayimGostergesiProps) {
  const hizmetSecili =
    sorunTipi && gecerliSorunTipi(sorunTipi) ? sorunTipi : null;
  const satir =
    hizmetSecili && ozet
      ? hizmetVerenSatirBul(ozet, hizmetSecili)
      : undefined;

  const cevrimici = hizmetSecili
    ? (satir?.cevrimici ?? 0)
    : (ozet?.benzersizCevrimici ?? 0);
  const aktif = hizmetSecili
    ? (satir?.aktif ?? 0)
    : (ozet?.benzersizAktif ?? 0);
  const animCevrimici = useAnimatedNumber(cevrimici);

  if (yukleniyor && !ozet) {
    return (
      <p className="text-sm text-slate-400 text-center py-1">
        Hizmet verenler yükleniyor…
      </p>
    );
  }

  if (aktif === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-1">
        Kayıtlı hizmet veren yok
      </p>
    );
  }

  return (
    <div
      className="rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-white px-3.5 py-2.5 flex items-center justify-center gap-2.5"
      role="status"
      aria-live="polite"
    >
      <CevrimiciNokta />
      <p className="text-sm text-slate-700 leading-snug text-center">
        <span className="font-bold tabular-nums text-emerald-700 text-base">
          {animCevrimici}
        </span>{" "}
        online
      </p>
    </div>
  );
}
