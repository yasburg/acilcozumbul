"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui";
import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";
import { CircleHelp, MessageCircle } from "lucide-react";

const STORAGE_KEY = "acil_nasil_calisir_kapali";
const ADIM_SURE_MS = 3000;

type FormAdimi =
  | "sorun"
  | "bilgi"
  | "konum"
  | "detay"
  | "fotograf"
  | "arac_tipi"
  | "arac_modeli"
  | "ek_detay"
  | "ihale"
  | "hedef";

type NasilAdim = {
  ikon: "help" | "location" | "offers" | "check";
  baslik: string;
  aciklama: string;
};

function NasilIkon({ ikon }: { ikon: NasilAdim["ikon"] }) {
  const cls = "size-5";
  if (ikon === "help") {
    return <CircleHelp className={cls} strokeWidth={ACB_ICON_STROKE} aria-hidden />;
  }
  if (ikon === "location") {
    return (
      <AcbIcons.location className={cls} strokeWidth={ACB_ICON_STROKE} aria-hidden />
    );
  }
  if (ikon === "offers") {
    return (
      <MessageCircle className={cls} strokeWidth={ACB_ICON_STROKE} aria-hidden />
    );
  }
  return (
    <AcbIcons.check className={cls} strokeWidth={ACB_ICON_STROKE} aria-hidden />
  );
}

const NASIL_ADIMLAR: NasilAdim[] = [
  {
    ikon: "help",
    baslik: "Yardım iste",
    aciklama: "Tek dokunuşla acil talep başlat",
  },
  {
    ikon: "location",
    baslik: "Konumunu paylaş",
    aciklama: "Neredesin — yakındaki ekipler görsün",
  },
  {
    ikon: "offers",
    baslik: "Teklifleri gör",
    aciklama: "Fiyat ve süreyi karşılaştır",
  },
  {
    ikon: "check",
    baslik: "Birini seç",
    aciklama: "Uygun teklifi seç, yardım yola çıksın",
  },
];

function formAdimindenAnchor(adim: FormAdimi): number {
  if (adim === "sorun") return 0;
  if (adim === "hedef") return 1;
  if (
    adim === "bilgi" ||
    adim === "konum" ||
    adim === "detay" ||
    adim === "fotograf" ||
    adim === "arac_tipi" ||
    adim === "arac_modeli" ||
    adim === "ek_detay" ||
    adim === "ihale"
  ) {
    return 2;
  }
  return 0;
}

type Props = {
  aktifFormAdimi?: FormAdimi;
};

export function NasilCalisirSerit({ aktifFormAdimi = "sorun" }: Props) {
  const [kapali, setKapali] = useState(false);
  const [otomatikIdx, setOtomatikIdx] = useState(0);
  const [animasyonEpoch, setAnimasyonEpoch] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const anchor = useMemo(
    () => formAdimindenAnchor(aktifFormAdimi),
    [aktifFormAdimi]
  );

  useEffect(() => {
    try {
      setKapali(sessionStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const guncelle = () => setReducedMotion(mq.matches);
    guncelle();
    mq.addEventListener("change", guncelle);
    return () => mq.removeEventListener("change", guncelle);
  }, []);

  useEffect(() => {
    if (reducedMotion || kapali) return;
    const id = setInterval(() => {
      setOtomatikIdx((i) => (i + 1) % NASIL_ADIMLAR.length);
    }, ADIM_SURE_MS);
    return () => clearInterval(id);
  }, [reducedMotion, kapali, animasyonEpoch]);

  useEffect(() => {
    setOtomatikIdx(anchor);
    setAnimasyonEpoch((e) => e + 1);
  }, [anchor]);

  const adimSec = useCallback((idx: number) => {
    setOtomatikIdx(idx);
    setAnimasyonEpoch((e) => e + 1);
  }, []);

  const toggle = useCallback(() => {
    setKapali((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  if (kapali) {
    return (
      <div className="mb-4">
        <button
          type="button"
          onClick={toggle}
          className="w-full text-center text-xs font-medium text-amber-700 underline py-1"
        >
          Nasıl çalışır? — Göster
        </button>
      </div>
    );
  }

  const aktifAdim = NASIL_ADIMLAR[otomatikIdx];

  return (
    <Card className="mb-4 !py-3 !px-3 border-amber-100 bg-gradient-to-b from-amber-50/80 to-white overflow-visible">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
          Nasıl çalışır?
        </p>
        <button
          type="button"
          onClick={toggle}
          className="text-xs text-slate-500 hover:text-slate-700 shrink-0"
        >
          Gizle
        </button>
      </div>

      <div className="overflow-x-auto -mx-1 px-1 pt-2 pb-1">
        <div className="flex items-start min-w-[min(100%,280px)] py-1">
          {NASIL_ADIMLAR.map((adim, i) => {
            const aktif = i === otomatikIdx;
            const gecildi = i < otomatikIdx;
            return (
              <div key={adim.baslik} className="flex items-start flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-[4.5rem]">
                  <div className="flex h-14 w-14 items-center justify-center">
                    <button
                      type="button"
                      onClick={() => adimSec(i)}
                      aria-label={`${adim.baslik}: ${adim.aciklama}`}
                      aria-current={aktif ? "step" : undefined}
                      className={[
                        "relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg transition-all duration-300 touch-manipulation",
                        aktif
                          ? "border-amber-500 bg-amber-100 shadow-sm animate-nasil-adim-aktif animate-nasil-glow"
                          : gecildi
                            ? "border-amber-300 bg-amber-50 hover:border-amber-400"
                            : "border-slate-200 bg-white text-slate-400 hover:border-amber-300 hover:text-slate-600",
                      ].join(" ")}
                    >
                      <NasilIkon ikon={adim.ikon} />
                    </button>
                  </div>
                  <p
                    className={[
                      "mt-1.5 text-[10px] font-semibold text-center leading-tight px-0.5",
                      aktif ? "text-amber-900" : "text-slate-500",
                    ].join(" ")}
                  >
                    {adim.baslik}
                  </p>
                </div>
                {i < NASIL_ADIMLAR.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mt-7 min-w-[0.75rem] mx-0.5 rounded-full bg-slate-200 overflow-hidden"
                    aria-hidden
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 ease-out"
                      style={{
                        width: otomatikIdx > i ? "100%" : "0%",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p
        className="text-xs text-slate-600 text-center mt-2 min-h-[2rem] leading-snug transition-opacity duration-300"
        role="status"
        aria-live="polite"
      >
        {aktifAdim.aciklama}
      </p>
    </Card>
  );
}
