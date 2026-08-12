"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { ACB_ICON_STROKE } from "@/lib/acb-icons";

const TITLE_FULL = "Yolda mı kaldın?";
const SUBTITLE_TEXT = "Acil çözüm bulalım.";
const SESSION_KEY = "acb_hero_typewriter_seen";

/**
 * Emergency entry — one job: ask for help.
 * Features a smooth typewriter + slide-up intro animation on first visit,
 * and a fast center-to-top slide-up reveal on repeat visits.
 */
export function EmergencyHero({
  ctaDocked = false,
  onHeroReady,
}: {
  /** True when YARDIM AL has moved into the sticky header */
  ctaDocked?: boolean;
  /** Callback when hero intro finishes or is already ready */
  onHeroReady?: (ready: boolean) => void;
}) {
  const [stage, setStage] = useState<"typing" | "subtitle" | "short_intro" | "sliding" | "ready">("typing");
  const [typedIndex, setTypedIndex] = useState(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        // Repeat visit: start centered with full text, then slide up immediately
        setStage("short_intro");
        onHeroReady?.(false);
        return;
      }
    } catch {
      /* ignore */
    }

    // First visit in session: full typewriter intro sequence
    setStage("typing");
    onHeroReady?.(false);
    setTypedIndex(0);
  }, [onHeroReady]);

  // Short intro mode: slide up automatically after brief mount frame
  useEffect(() => {
    if (stage !== "short_intro") return;

    const timer = setTimeout(() => {
      setStage("sliding");
      onHeroReady?.(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [stage, onHeroReady]);

  useEffect(() => {
    if (stage !== "typing") return;

    if (typedIndex === 0) {
      const startTimer = setTimeout(() => {
        setTypedIndex(1);
      }, 350);
      return () => clearTimeout(startTimer);
    }

    if (typedIndex < TITLE_FULL.length) {
      const timer = setTimeout(() => {
        setTypedIndex((prev) => prev + 1);
      }, 70);
      return () => clearTimeout(timer);
    }

    const subtitleTimer = setTimeout(() => {
      setStage("subtitle");
    }, 250);

    return () => clearTimeout(subtitleTimer);
  }, [stage, typedIndex]);

  useEffect(() => {
    if (stage !== "subtitle") return;

    const slideTimer = setTimeout(() => {
      setStage("sliding");
      onHeroReady?.(true);
    }, 450);

    return () => clearTimeout(slideTimer);
  }, [stage, onHeroReady]);

  useEffect(() => {
    if (stage !== "sliding") return;

    const readyTimer = setTimeout(() => {
      setStage("ready");
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 550);

    return () => clearTimeout(readyTimer);
  }, [stage]);

  const isIntro = stage === "typing";
  const isTyping = stage === "typing";
  const isSubtitleVisible = stage === "subtitle" || stage === "short_intro" || stage === "sliding" || stage === "ready";
  const isCentered = stage === "typing" || stage === "subtitle" || stage === "short_intro";
  const isContentVisible = stage === "sliding" || stage === "ready";

  return (
    <section className="relative flex h-[100dvh] max-h-[100dvh] w-full flex-col justify-between overflow-hidden animate-fade-in">
      {/* 1. Üst Bölüm: Logo bandı + Başlık + Altbaşlık */}
      <div className="flex flex-1 flex-col items-center justify-center text-center pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div
          id="acb-hero-logo-band"
          className="shrink-0"
          style={{ height: "var(--acb-hero-logo-band)" }}
          aria-hidden
        />
        <div
          className={`mt-1 px-4 transition-transform duration-600 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isCentered ? "translate-y-[18vh] sm:translate-y-[20vh]" : "translate-y-0"
          }`}
        >
          <h1
            id="acb-hero-baslik"
            className="acb-display text-[2.15rem] font-bold text-[var(--acb-dark)] sm:text-[2.85rem] min-h-[3rem]"
          >
            {isIntro ? TITLE_FULL.slice(0, typedIndex) : TITLE_FULL}
            {isTyping && (
              <span
                className="inline-block ml-0.5 w-[3px] h-[1.9rem] sm:h-[2.4rem] bg-[var(--acb-green,#089b2d)] align-middle animate-pulse"
                aria-hidden
              />
            )}
          </h1>
          <p
            className={`mt-2.5 mx-auto max-w-[17.5rem] text-center text-[1.0625rem] font-medium leading-snug tracking-[0.01em] text-[var(--acb-muted)] sm:max-w-sm sm:text-xl transition-all duration-400 ease-out ${
              isSubtitleVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            {SUBTITLE_TEXT}
          </p>
        </div>
      </div>

      {/* 2. Orta Bölüm: Ekranın tam ortası (50% / 50vh) - YARDIM AL Buton Yuvası (Sabit Yuva) */}
      <div className="shrink-0 w-full max-w-md mx-auto px-4 py-1">
        <div
          id="acb-hero-yardim-cta"
          className="min-h-[3.6rem] w-full"
          aria-hidden
        />
      </div>

      {/* 3. Alt Bölüm: Ekranın 3/4 noktası (~75% / 75vh) - Güven metinleri */}
      <div
        className={`flex flex-1 flex-col items-center justify-center px-4 transition-all duration-600 delay-75 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isContentVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        <p
          className={`acb-hero-trust space-y-1 text-center text-[0.9375rem] font-medium leading-snug tracking-[0.01em] transition-opacity duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] sm:text-base ${
            ctaDocked ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden={ctaDocked}
        >
          <span className="acb-hero-trust-line block font-semibold">
            Kayıt yok
          </span>
          <span className="acb-hero-trust-line block">
            2 dakikada 5+ teklif al
          </span>
          <span className="acb-hero-trust-line block">
            En uygunu seç.
          </span>
        </p>
      </div>

      {/* 4. En Alt Bölüm: Chevron yukarı bakan Hakkında butonu */}
      <div
        className={`shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center transition-all duration-600 delay-150 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isContentVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        <a
          href="#nasil-calisir"
          className="acb-scroll-hint group inline-flex flex-col items-center gap-0 py-1.5 text-[var(--acb-muted)] touch-manipulation active:opacity-70"
        >
          <ChevronUp
            className="size-4 -mb-0.5"
            strokeWidth={ACB_ICON_STROKE}
            aria-hidden
          />
          <span className="text-[11px] font-medium tracking-[0.04em] leading-tight">
            Acil Çözüm Bul Hakkında
          </span>
        </a>
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.removeItem(SESSION_KEY);
              } catch {
                /* ignore */
              }
              window.location.reload();
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-800 shadow-2xs hover:bg-amber-100 active:scale-95 touch-manipulation"
          >
            ⚡ Debug: İlk Açılış Animasyonunu Test Et
          </button>
        </div>
      </div>
    </section>
  );
}

