"use client";

import { useEffect, useRef, useState } from "react";
import {
  hizmetVerenEtiket,
  hizmetVerenSatirBul,
  type HizmetVerenSayimOzet,
} from "@/lib/hizmet-veren-sayim";
import { gecerliSorunTipi } from "@/lib/sorun-tipleri";
import { sehirdeYazi } from "@/lib/turkiye-il-nufus";

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
    <span className="relative inline-flex h-1.5 w-1.5 shrink-0" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
    </span>
  );
}

interface HizmetVerenSayimGostergesiProps {
  ozet: HizmetVerenSayimOzet | null;
  yukleniyor?: boolean;
  /** Seçili hizmet tipi — yoksa tüm platform özeti */
  sorunTipi?: string | null;
  /** Seçili şehir — yoksa şehir öneki gösterilmez */
  sehirAd?: string | null;
  /** Header / ince bant */
  compact?: boolean;
}

export function HizmetVerenSayimGostergesi({
  ozet,
  yukleniyor,
  sorunTipi,
  sehirAd,
  compact = false,
}: HizmetVerenSayimGostergesiProps) {
  const hizmetSecili =
    sorunTipi && gecerliSorunTipi(sorunTipi) ? sorunTipi : null;
  const satir =
    hizmetSecili && ozet
      ? hizmetVerenSatirBul(ozet, hizmetSecili)
      : undefined;

  const aktif = hizmetSecili
    ? (satir?.aktif ?? 0)
    : (ozet?.benzersizAktif ?? 0);
  const animSayi = useAnimatedNumber(aktif);
  const meslek = hizmetSecili ? hizmetVerenEtiket(hizmetSecili) : null;
  const birim = meslek ?? "firma";
  const sehirOnEk = sehirAd?.trim() ? `${sehirdeYazi(sehirAd.trim())} ` : "";

  if (yukleniyor && !ozet) {
    return (
      <p
        className={[
          "text-slate-400 text-center",
          compact ? "text-[11px] leading-tight py-0" : "text-xs py-0.5",
        ].join(" ")}
      >
        Firmalar yükleniyor…
      </p>
    );
  }

  if (aktif === 0) {
    return (
      <p
        className={[
          "text-slate-500 text-center",
          compact ? "text-[11px] leading-tight py-0" : "text-xs py-0.5",
        ].join(" ")}
      >
        Aktif firma yok
      </p>
    );
  }

  const metin = `${sehirOnEk}${animSayi} aktif ${birim}`;

  return (
    <div
      className={[
        "flex items-center justify-start gap-1.5 text-slate-700",
        compact
          ? "py-0"
          : "rounded-md bg-emerald-50/70 border border-emerald-100/70 px-2 py-0.5",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <CevrimiciNokta />
      <p
        className={[
          "leading-snug text-left",
          compact ? "text-[11px] truncate" : "text-xs",
        ].join(" ")}
      >
        {sehirOnEk}
        <span className="font-bold tabular-nums text-emerald-700">
          {animSayi}
        </span>{" "}
        aktif {birim}
      </p>
      <span className="sr-only">{metin}</span>
    </div>
  );
}
