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
    <div className="flex items-center justify-between gap-3 py-2.5">
      <p className="text-sm font-medium text-[var(--acb-dark)]">{label}</p>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={[
          "relative h-6 w-11 shrink-0 rounded-full transition-colors touch-manipulation",
          checked ? "bg-[var(--acb-green,#089b2d)]" : "bg-slate-300",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

const yalnizcaGerekliSinif =
  "min-h-9 shrink-0 rounded-xl border border-[var(--acb-border,#e5e7eb)] bg-white text-[var(--acb-muted,#64748b)] text-xs font-medium px-3 py-2 hover:bg-slate-50 hover:text-[var(--acb-dark)] touch-manipulation whitespace-nowrap";

const ikonDugmeSinif =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-[var(--acb-muted)] transition hover:bg-[var(--acb-soft,#eaf8ee)] hover:text-[var(--acb-dark)] touch-manipulation";

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
        className="absolute inset-0 bg-[rgb(27_45_42/0.45)] backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-[20rem] overflow-hidden rounded-[var(--acb-radius-lg,1.25rem)] border border-[var(--acb-border,#e5e7eb)] bg-white shadow-[0_20px_48px_rgb(27_45_42/0.22)]"
      >
        <div className="flex items-center justify-between gap-2 border-b border-[var(--acb-border,#e5e7eb)] px-4 py-3">
          <p
            id={titleId}
            className="text-base font-bold text-[var(--acb-dark)]"
          >
            {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            className={ikonDugmeSinif}
            aria-label="Kapat"
          >
            <span className="text-lg leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>
        <div className="px-4 py-3">{children}</div>
        <div className="flex gap-2 border-t border-[var(--acb-border,#e5e7eb)] px-4 py-3">
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
          className="pointer-events-none fixed inset-x-0 z-[100] bottom-[var(--acil-sticky-cta-h,env(safe-area-inset-bottom,0px))]"
          role="dialog"
          aria-labelledby="cerez-banner-baslik"
          aria-describedby="cerez-banner-aciklama"
        >
          <div className="pointer-events-auto mx-auto max-w-lg border-t border-[var(--acb-border,#e5e7eb)] bg-white/92 px-3 py-2.5 shadow-[0_-8px_28px_rgb(27_45_42/0.1)] backdrop-blur-md">
            <h2
              id="cerez-banner-baslik"
              className="mb-2 text-center text-xs font-medium text-[var(--acb-muted,#64748b)]"
            >
              Çerezleri kullanıyoruz
            </h2>
            <p id="cerez-banner-aciklama" className="sr-only">
              Zorunlu çerezler site için gereklidir. İsteğe bağlı analitik
              çerezlerini kabul edebilir veya ayarlardan yönetebilirsiniz.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => tercihKaydet("tumu", kapat)}
                className="min-h-9 flex-1 rounded-xl bg-[var(--acb-green,#089b2d)] px-3 py-2 text-xs font-bold tracking-[0.01em] text-white shadow-[var(--acb-shadow-cta)] transition hover:bg-[var(--acb-green-hover,#077f25)] touch-manipulation active:scale-[0.98]"
              >
                Kabul et
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnalitikAcik(true);
                  setGorunum("ayarlar");
                }}
                className={yalnizcaGerekliSinif}
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
              className="min-h-11 flex-1 rounded-xl border border-[var(--acb-border)] bg-white text-sm font-semibold text-[var(--acb-dark)] touch-manipulation"
            >
              Geri
            </button>
            <button
              type="button"
              onClick={() => {
                if (analitikAcik) tercihKaydet("tumu", kapat);
                else setGorunum("onay");
              }}
              className="min-h-11 flex-[1.4] rounded-xl bg-[var(--acb-green)] text-sm font-bold text-white shadow-[var(--acb-shadow-cta)] touch-manipulation active:scale-[0.98]"
            >
              Kaydet
            </button>
          </>
        }>
          <div className="mb-3 space-y-1.5">
            <p className="text-sm font-semibold text-[var(--acb-dark)]">
              Çerez (Cookie) Bilgilendirme Metni
            </p>
            <p className="text-[12px] leading-snug text-[var(--acb-muted)]">
              Sitemizde, size en iyi deneyimi sunmak, siteyi nasıl kullandığınızı
              anlamak ve içeriği geliştirmek için çerezler kullanıyoruz.{" "}
              <Link
                href="/cerez-politikasi"
                onClick={() => setGorunum("ozet")}
                className="font-medium text-[var(--acb-dark)] underline underline-offset-2"
              >
                İncelemek için buraya tıklayın.
              </Link>
            </p>
          </div>
          <div className="divide-y divide-[var(--acb-border)] rounded-xl border border-[var(--acb-border)] bg-[var(--acb-soft)]/40 px-3">
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
                className="min-h-11 flex-1 rounded-xl border border-[var(--acb-border)] bg-white text-sm font-semibold text-[var(--acb-dark)] touch-manipulation"
              >
                Geri
              </button>
              <button
                type="button"
                onClick={() => tercihKaydet("zorunlu", kapat)}
                className="min-h-11 flex-[1.4] rounded-xl bg-[var(--acb-green)] text-sm font-bold text-white shadow-[var(--acb-shadow-cta)] touch-manipulation active:scale-[0.98]"
              >
                Gerekli
              </button>
            </>
          }
        >
          <p className="text-sm leading-snug text-[var(--acb-muted)]">
            Analitik kapalı kalacak.
          </p>
        </CerezPopup>
      ) : null}
    </>
  );
}
