"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  cerezBannerGosterilmeli,
  cerezBannerKapat,
  cerezOnayKaydet,
} from "@/lib/cerez-onay";
import { posthogCerezSenkronize } from "@/lib/posthog-client";
import { gtagCerezSenkronize } from "@/lib/gtag";
import {
  metaPixelCerezSenkronize,
  metaPixelPageView,
} from "@/lib/meta-pixel";

type Gorunum = "ozet" | "ayarlar" | "onay";

function tercihKaydet(tercih: "tumu" | "zorunlu", kapat: () => void) {
  cerezOnayKaydet(tercih);
  posthogCerezSenkronize();
  gtagCerezSenkronize();
  metaPixelCerezSenkronize();
  if (tercih === "tumu") {
    metaPixelPageView();
  }
  kapat();
}

function bannerSubscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("acil-cerez-banner", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("acil-cerez-banner", handler);
  };
}

function bannerSnapshot() {
  return cerezBannerGosterilmeli();
}

function bannerServerSnapshot() {
  return false;
}

function bannerDegisti() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("acil-cerez-banner"));
}

function Toggle({
  checked,
  disabled,
  onChange,
  label,
  aciklama,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  label: string;
  aciklama: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          {aciklama}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={[
          "relative shrink-0 h-7 w-12 rounded-full transition-colors touch-manipulation",
          checked ? "bg-amber-500" : "bg-slate-300",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

export function CerezOnayBanner() {
  const gosterilmeli = useSyncExternalStore(
    bannerSubscribe,
    bannerSnapshot,
    bannerServerSnapshot
  );
  const [goster, setGoster] = useState(true);
  const [gorunum, setGorunum] = useState<Gorunum>("ozet");
  /** Ayarlar açılınca varsayılan açık — reddetmek için bilinçli kapatmak gerekir */
  const [analitikAcik, setAnalitikAcik] = useState(true);

  if (!gosterilmeli || !goster) return null;

  const kapat = () => {
    setGoster(false);
    bannerDegisti();
  };

  const baslik =
    gorunum === "ozet"
      ? "Çerezler"
      : gorunum === "ayarlar"
        ? "Çerezleri ayarla"
        : "Tercihinizi onaylayın";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] p-3 pointer-events-none"
      role="dialog"
      aria-labelledby="cerez-banner-baslik"
      aria-describedby="cerez-banner-aciklama"
    >
      <div className="pointer-events-auto max-w-lg mx-auto rounded-xl border border-slate-200 bg-white shadow-lg px-3.5 py-3 space-y-2.5">
        <div>
          <p
            id="cerez-banner-baslik"
            className="text-sm font-semibold text-slate-900"
          >
            {baslik}
          </p>
          <p
            id="cerez-banner-aciklama"
            className="text-xs text-slate-600 mt-0.5 leading-snug"
          >
            {gorunum === "ozet" ? (
              <>
                Zorunlu çerezler site için gerekli. İsteğe bağlı çerezler için{" "}
                <Link
                  href="/cerez-politikasi"
                  className="text-amber-700 underline"
                >
                  Çerez Politikası
                </Link>
                .
              </>
            ) : gorunum === "ayarlar" ? (
              <>
                Zorunlu çerezler kapatılamaz. Analitik ve reklam çerezlerini
                buradan yönetin.{" "}
                <Link
                  href="/cerez-politikasi"
                  className="text-amber-700 underline"
                >
                  Çerez Politikası
                </Link>
              </>
            ) : (
              <>
                Analitik ve reklam çerezleri kapalı kalacak. Dönüşüm ölçümü
                sınırlı olabilir.
              </>
            )}
          </p>
        </div>

        {gorunum === "ayarlar" ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 divide-y divide-slate-200">
            <Toggle
              checked
              disabled
              label="Zorunlu çerezler"
              aciklama="Oturum, güvenlik ve temel site işlevleri."
            />
            <Toggle
              checked={analitikAcik}
              onChange={setAnalitikAcik}
              label="Analitik ve reklam"
              aciklama="Google Analytics, Ads dönüşümleri ve benzeri ölçüm."
            />
          </div>
        ) : null}

        {gorunum === "ozet" ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => tercihKaydet("tumu", kapat)}
              className="w-full min-h-[40px] rounded-lg bg-amber-500 text-white text-sm font-semibold px-4 py-2 hover:bg-amber-600 touch-manipulation"
            >
              Tümünü kabul et
            </button>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setAnalitikAcik(true);
                  setGorunum("ayarlar");
                }}
                className="text-[11px] text-slate-300 hover:text-slate-400 underline-offset-2 hover:underline touch-manipulation"
              >
                Çerezleri ayarla
              </button>
              <button
                type="button"
                onClick={() => {
                  cerezBannerKapat();
                  kapat();
                }}
                className="text-[11px] text-slate-300 hover:text-slate-400 touch-manipulation"
              >
                Vazgeç
              </button>
            </div>
          </div>
        ) : null}

        {gorunum === "ayarlar" ? (
          <div className="flex flex-col gap-2">
            {analitikAcik ? (
              <button
                type="button"
                onClick={() => tercihKaydet("tumu", kapat)}
                className="w-full min-h-[40px] rounded-lg bg-amber-500 text-white text-sm font-semibold px-4 py-2 hover:bg-amber-600 touch-manipulation"
              >
                Tercihleri kaydet
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setGorunum("onay")}
                className="w-full min-h-[40px] rounded-lg border border-slate-200 bg-slate-50 text-slate-400 text-sm font-medium px-4 py-2 hover:bg-slate-100 touch-manipulation"
              >
                Devam et
              </button>
            )}
            <button
              type="button"
              onClick={() => setGorunum("ozet")}
              className="w-full min-h-[36px] text-[11px] text-slate-300 hover:text-slate-400 touch-manipulation"
            >
              Geri
            </button>
          </div>
        ) : null}

        {gorunum === "onay" ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setAnalitikAcik(true);
                setGorunum("ayarlar");
              }}
              className="w-full min-h-[40px] rounded-lg bg-amber-500 text-white text-sm font-semibold px-4 py-2 hover:bg-amber-600 touch-manipulation"
            >
              Analitiği açık bırak
            </button>
            <button
              type="button"
              onClick={() => tercihKaydet("zorunlu", kapat)}
              className="w-full min-h-[36px] text-[11px] text-slate-300 hover:text-slate-400 underline-offset-2 hover:underline touch-manipulation"
            >
              Yalnızca zorunlu çerezlerle devam et
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
