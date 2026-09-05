"use client";

import {
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
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
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <p className="text-[0.75rem] font-medium text-slate-700">{label}</p>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={[
          "relative h-5 w-9 shrink-0 rounded-full transition-colors touch-manipulation",
          checked ? "bg-slate-700" : "bg-slate-300",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

const ikonDugmeSinif =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--acb-radius-sm)] text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 touch-manipulation";

function CerezPopup({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-[20rem] overflow-hidden rounded-[var(--acb-radius-lg)] border border-[var(--acb-border)] bg-white shadow-[var(--acb-shadow-xl)]"
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
          <p
            id={titleId}
            className="text-[0.75rem] font-bold text-slate-800"
          >
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            className={ikonDugmeSinif}
            aria-label="Kapat"
          >
            <span className="text-base leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>
        <div className="px-4 py-3">{children}</div>
        <div className="flex gap-2 border-t border-slate-100 px-4 py-2.5">
          {footer}
        </div>
      </div>
    </div>,
    document.body
  );
}

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
    setGorunum("ozet");
    bannerDegisti();
  };

  const popupKapat = () => {
    if (zorlaAcik && !gosterilmeli) {
      kapat();
      return;
    }
    setGorunum("ozet");
  };

  return (
    <>
      {/* Alt şerit — yalnızca özet */}
      {gorunum === "ozet" ? (
        <div
          className="pointer-events-none fixed inset-x-0 z-[100] bottom-[calc(var(--acil-sticky-cta-h,env(safe-area-inset-bottom,0px))+0.5rem)]"
          role="dialog"
          aria-labelledby="cerez-banner-baslik"
          aria-describedby="cerez-banner-aciklama"
        >
          <div className="pointer-events-auto mx-auto max-w-lg border-t border-white/60 bg-white/90 px-3 py-1.5 shadow-[0_-10px_30px_-8px_rgba(27,45,42,0.14),inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-xl backdrop-saturate-150">
            <p id="cerez-banner-aciklama" className="sr-only">
              Zorunlu çerezler site için gereklidir. İsteğe bağlı analitik
              çerezlerini kabul edebilir veya ayarlardan yönetebilirsiniz.
            </p>
            <div className="flex items-center gap-2">
              <h2
                id="cerez-banner-baslik"
                className="min-w-0 flex-1 truncate text-[0.7rem] font-medium text-slate-500"
              >
                Çerezleri kullanıyoruz
              </h2>
              <button
                type="button"
                onClick={() => tercihKaydet("tumu", kapat)}
                className="min-h-8 shrink-0 rounded-[var(--acb-radius-sm)] border border-slate-300 bg-white px-3 py-1.5 text-[0.75rem] font-medium text-slate-700 shadow-[var(--acb-shadow)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-slate-50 hover:text-slate-900 hover:shadow-[var(--acb-shadow-lg)] touch-manipulation active:scale-[0.98]"
              >
                Kabul et
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnalitikAcik(true);
                  setGorunum("ayarlar");
                }}
                className="min-h-8 shrink-0 rounded-[var(--acb-radius-sm)] border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[0.75rem] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 touch-manipulation whitespace-nowrap"
              >
                Ayarla
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {gorunum === "ayarlar" ? (
        <CerezPopup title="Çerezler" onClose={popupKapat} footer={
          <>
            <button
              type="button"
              onClick={popupKapat}
              className="min-h-8 flex-1 rounded-[var(--acb-radius-sm)] border border-slate-200 bg-white text-[0.75rem] font-medium text-slate-700 hover:bg-slate-50 touch-manipulation"
            >
              Geri
            </button>
            <button
              type="button"
              onClick={() => {
                if (analitikAcik) tercihKaydet("tumu", kapat);
                else setGorunum("onay");
              }}
              className="min-h-8 flex-[1.4] rounded-[var(--acb-radius-sm)] border border-slate-300 bg-slate-100 text-[0.75rem] font-medium text-slate-800 hover:bg-slate-200 touch-manipulation active:scale-[0.98]"
            >
              Kaydet
            </button>
          </>
        }>
          <div className="mb-3 space-y-1">
            <p className="text-[0.75rem] font-bold text-slate-800">
              Çerez (Cookie) Bilgilendirme Metni
            </p>
            <p className="text-[0.75rem] leading-snug text-slate-500">
              Sitemizde, size en iyi deneyimi sunmak, siteyi nasıl kullandığınızı
              anlamak ve içeriği geliştirmek için çerezler kullanıyoruz.{" "}
              <Link
                href="/cerez-politikasi"
                onClick={() => setGorunum("ozet")}
                className="font-medium text-slate-800 underline underline-offset-2"
              >
                İncelemek için buraya tıklayın.
              </Link>
            </p>
          </div>
          <div className="divide-y divide-slate-100 rounded-[var(--acb-radius)] border border-slate-200 bg-slate-50/50 px-3">
            <Toggle checked disabled label="Zorunlu" />
            <Toggle
              checked={analitikAcik}
              onChange={setAnalitikAcik}
              label="Analitik"
            />
          </div>
        </CerezPopup>
      ) : null}

      {gorunum === "onay" ? (
        <CerezPopup
          title="Emin misiniz?"
          onClose={() => setGorunum("ayarlar")}
          footer={
            <>
              <button
                type="button"
                onClick={() => {
                  setAnalitikAcik(true);
                  setGorunum("ayarlar");
                }}
                className="min-h-8 flex-1 rounded-[var(--acb-radius-sm)] border border-slate-200 bg-white text-[0.75rem] font-medium text-slate-700 hover:bg-slate-50 touch-manipulation"
              >
                Geri
              </button>
              <button
                type="button"
                onClick={() => tercihKaydet("zorunlu", kapat)}
                className="min-h-8 flex-[1.4] rounded-[var(--acb-radius-sm)] border border-slate-300 bg-slate-100 text-[0.75rem] font-medium text-slate-800 hover:bg-slate-200 touch-manipulation active:scale-[0.98]"
              >
                Gerekli
              </button>
            </>
          }
        >
          <p className="text-[0.75rem] leading-snug text-slate-500">
            Analitik kapalı kalacak.
          </p>
        </CerezPopup>
      ) : null}
    </>
  );
}
