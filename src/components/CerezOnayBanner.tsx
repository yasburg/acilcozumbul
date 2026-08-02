"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  cerezBannerGosterilmeli,
  cerezManuelSilmeSenkronize,
  cerezOnayKaydet,
  cerezOnayOku,
} from "@/lib/cerez-onay";
import { posthogCerezSenkronize } from "@/lib/posthog-client";
import { gtagCerezSenkronize } from "@/lib/gtag";
import {
  metaPixelCerezSenkronize,
  metaPixelPageView,
} from "@/lib/meta-pixel";
import {
  tiktokPixelCerezSenkronize,
  tiktokPixelPageView,
} from "@/lib/tiktok-pixel";

type Gorunum = "ozet" | "ayarlar" | "onay";

function terciheGoreSenkronize(tercih: "tumu" | "zorunlu") {
  posthogCerezSenkronize();
  gtagCerezSenkronize();
  metaPixelCerezSenkronize();
  tiktokPixelCerezSenkronize();
  if (tercih === "tumu") {
    void metaPixelPageView();
    tiktokPixelPageView();
  }
}

function tercihKaydet(tercih: "tumu" | "zorunlu", kapat: () => void) {
  cerezOnayKaydet(tercih);
  terciheGoreSenkronize(tercih);
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
    <div className="flex items-start justify-between gap-3 py-1">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-900">{label}</p>
        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
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
          "relative shrink-0 h-5 w-9 rounded-full transition-colors touch-manipulation",
          checked ? "bg-amber-500" : "bg-slate-300",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

const dugmeSinif =
  "min-h-[32px] flex-1 rounded-md border border-slate-300 bg-white text-slate-800 text-xs font-semibold px-2 py-1.5 hover:bg-slate-50 touch-manipulation";

const yalnizcaGerekliSinif =
  "min-h-[32px] flex-1 rounded-md border border-slate-200 bg-transparent text-slate-400 text-xs font-medium px-2 py-1.5 hover:bg-slate-50 hover:text-slate-500 touch-manipulation";

export function CerezOnayBanner() {
  const gosterilmeli = useSyncExternalStore(
    bannerSubscribe,
    bannerSnapshot,
    bannerServerSnapshot
  );
  const [goster, setGoster] = useState(true);
  const [zorlaAcik, setZorlaAcik] = useState(false);
  const [gorunum, setGorunum] = useState<Gorunum>("ozet");
  const [analitikAcik, setAnalitikAcik] = useState(true);

  useEffect(() => {
    cerezManuelSilmeSenkronize();
    posthogCerezSenkronize();
    gtagCerezSenkronize();
    metaPixelCerezSenkronize();
    tiktokPixelCerezSenkronize();
  }, []);

  useEffect(() => {
    const ac = () => {
      const mevcut = cerezOnayOku();
      setAnalitikAcik(mevcut !== "zorunlu");
      setGorunum(mevcut != null ? "ayarlar" : "ozet");
      setZorlaAcik(true);
      setGoster(true);
    };
    window.addEventListener("acil-cerez-banner-ac", ac);
    return () => window.removeEventListener("acil-cerez-banner-ac", ac);
  }, []);

  if ((!gosterilmeli && !zorlaAcik) || !goster) return null;

  const kapat = () => {
    setGoster(false);
    setZorlaAcik(false);
    bannerDegisti();
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] pointer-events-none pb-[env(safe-area-inset-bottom)]"
      role="dialog"
      aria-labelledby="cerez-banner-baslik"
      aria-describedby="cerez-banner-aciklama"
    >
      <div className="pointer-events-auto max-w-lg mx-auto bg-white/95 backdrop-blur-sm px-3 py-1.5 border-t border-slate-200 shadow-[0_-2px_12px_rgba(15,23,42,0.08)]">
        {gorunum === "ozet" ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p
              id="cerez-banner-baslik"
              className="text-[11px] text-slate-600 leading-snug min-w-0 flex-1"
            >
              Çerezleri yönetebilirsiniz.{" "}
              <Link
                href="/cerez-politikasi"
                className="underline underline-offset-2 text-slate-500 hover:text-slate-700"
              >
                Politika
              </Link>
            </p>
            <p id="cerez-banner-aciklama" className="sr-only">
              Zorunlu çerezler site için gereklidir. İsteğe bağlı analitik
              çerezlerini kabul edebilir veya reddedebilirsiniz.
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => tercihKaydet("zorunlu", kapat)}
                className={yalnizcaGerekliSinif}
              >
                Yalnızca gerekli
              </button>
              <button
                type="button"
                onClick={() => tercihKaydet("tumu", kapat)}
                className="min-h-[32px] rounded-md border border-amber-500 bg-amber-500 text-white text-xs font-semibold px-2.5 py-1.5 hover:bg-amber-600 touch-manipulation"
              >
                Tümünü kabul et
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnalitikAcik(true);
                  setGorunum("ayarlar");
                }}
                className="shrink-0 text-[11px] text-slate-500 underline underline-offset-2 hover:text-slate-700 touch-manipulation px-0.5"
              >
                Ayarlar
              </button>
            </div>
          </div>
        ) : null}

        {gorunum === "ayarlar" ? (
          <div className="space-y-1">
            <p
              id="cerez-banner-baslik"
              className="text-xs font-semibold text-slate-900"
            >
              Çerezleri ayarla
            </p>
            <div className="rounded-md border border-slate-100 bg-slate-50 px-2 divide-y divide-slate-200">
              <Toggle
                checked
                disabled
                label="Zorunlu"
                aciklama="Oturum ve güvenlik."
              />
              <Toggle
                checked={analitikAcik}
                onChange={setAnalitikAcik}
                label="Analitik ve reklam"
                aciklama="Ölçüm ve dönüşüm."
              />
            </div>
            <div className="flex items-center gap-2">
              {analitikAcik ? (
                <button
                  type="button"
                  onClick={() => tercihKaydet("tumu", kapat)}
                  className={dugmeSinif}
                >
                  Kaydet
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setGorunum("onay")}
                  className={dugmeSinif}
                >
                  Devam
                </button>
              )}
              <button
                type="button"
                onClick={() => setGorunum("ozet")}
                className="text-[11px] text-slate-500 underline touch-manipulation"
              >
                Geri
              </button>
            </div>
          </div>
        ) : null}

        {gorunum === "onay" ? (
          <div className="space-y-1">
            <p
              id="cerez-banner-baslik"
              className="text-xs font-semibold text-slate-900"
            >
              Analitik kapalı kalacak
            </p>
            <p
              id="cerez-banner-aciklama"
              className="text-[11px] text-slate-600 leading-snug"
            >
              Dönüşüm ölçümü sınırlı olabilir.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => tercihKaydet("zorunlu", kapat)}
                className={yalnizcaGerekliSinif}
              >
                Yalnızca gerekli
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnalitikAcik(true);
                  setGorunum("ayarlar");
                }}
                className="text-[11px] text-slate-600 underline touch-manipulation"
              >
                Analitiği aç
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
