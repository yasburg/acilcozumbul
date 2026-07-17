"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  cerezBannerGosterilmeli,
  cerezBannerKapat,
  cerezOnayKaydet,
} from "@/lib/cerez-onay";
import { posthogCerezSenkronize } from "@/lib/posthog-client";
import { gtagCerezSenkronize } from "@/lib/gtag";

export function CerezOnayBanner() {
  const [goster, setGoster] = useState(false);

  useEffect(() => {
    setGoster(cerezBannerGosterilmeli());
  }, []);

  if (!goster) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] p-4 pointer-events-none"
      role="dialog"
      aria-labelledby="cerez-banner-baslik"
      aria-describedby="cerez-banner-aciklama"
    >
      <div className="pointer-events-auto max-w-lg mx-auto rounded-2xl border border-slate-200 bg-white shadow-2xl p-4 space-y-4">
        <div>
          <p
            id="cerez-banner-baslik"
            className="text-sm font-semibold text-slate-900"
          >
            Çerez tercihleri
          </p>
          <p
            id="cerez-banner-aciklama"
            className="text-xs text-slate-600 mt-1 leading-relaxed"
          >
            Sitemizin çalışması için zorunlu çerezler kullanılır. İsteğe bağlı
            çerezler deneyimi iyileştirmek içindir. Detaylar için{" "}
            <Link href="/cerez-politikasi" className="text-amber-700 underline">
              Çerez Politikası
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => {
              cerezOnayKaydet("tumu");
              posthogCerezSenkronize();
              gtagCerezSenkronize();
              setGoster(false);
            }}
            className="flex-1 min-h-[44px] rounded-xl bg-amber-500 text-white text-sm font-semibold px-4 py-2.5 hover:bg-amber-600 touch-manipulation"
          >
            Tümünü kabul et
          </button>
          <button
            type="button"
            onClick={() => {
              cerezOnayKaydet("zorunlu");
              posthogCerezSenkronize();
              gtagCerezSenkronize();
              setGoster(false);
            }}
            className="flex-1 min-h-[44px] rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-medium px-4 py-2.5 hover:bg-slate-50 touch-manipulation"
          >
            Zorunlu olmayanları reddet
          </button>
          <button
            type="button"
            onClick={() => {
              cerezBannerKapat();
              setGoster(false);
            }}
            className="w-full sm:w-auto min-h-[44px] rounded-xl text-slate-500 text-sm font-medium px-4 py-2.5 hover:text-slate-700 touch-manipulation"
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );
}
