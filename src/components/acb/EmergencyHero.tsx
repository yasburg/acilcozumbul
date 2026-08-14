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
      {/* 1. Üst Bölüm: Logo bandı + Başlık + Altbaşlık (Üst Yarım) */}
      <div className="flex flex-1 flex-col items-center justify-between text-center pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
        <div
          id="acb-hero-logo-band"
          className="shrink-0"
          style={{ height: "var(--acb-hero-logo-band)" }}
          aria-hidden
        />
        <div
          className={`my-auto px-4 w-full max-w-md mx-auto transition-transform duration-600 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isCentered ? "translate-y-[14vh] sm:translate-y-[16vh]" : "translate-y-0"
          }`}
        >
          <h1
            id="acb-hero-baslik"
            className="acb-display text-[2.45rem] font-bold tracking-tight text-[var(--acb-dark)] sm:text-[3.25rem] leading-[1.12]"
          >
            {isIntro ? TITLE_FULL.slice(0, typedIndex) : TITLE_FULL}
            {isTyping && (
              <span
                className="inline-block ml-0.5 w-[3px] h-[2.1rem] sm:h-[2.7rem] bg-[var(--acb-green,#089b2d)] align-middle animate-pulse"
                aria-hidden
              />
            )}
          </h1>
          <p
            className={`mt-2 mx-auto max-w-[20rem] text-center text-[1.1875rem] font-medium leading-snug tracking-[0.01em] text-[var(--acb-muted)] sm:max-w-md sm:text-[1.375rem] transition-all duration-400 ease-out ${
              isSubtitleVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            {SUBTITLE_TEXT}
          </p>
        </div>
      </div>

      {/* 2. Tam Orta Nokta (50vh / 50% Vertical Center): YARDIM AL Buton Yuvası (Tam Matematiksel Merkez) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4 pointer-events-none z-0">
        <div
          id="acb-hero-yardim-cta"
          className="min-h-[3.6rem] w-full"
          aria-hidden
        />
      </div>

      {/* 3. Alt Yarım: Güven metinleri (Eşit Dağıtılmış Alt Bölüm) */}
      <div
        className={`flex flex-1 flex-col items-center justify-center px-4 transition-all duration-600 delay-75 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isContentVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <p
          className={`acb-hero-trust space-y-1.5 text-center text-[0.9375rem] font-medium leading-snug tracking-[0.01em] transition-opacity duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] sm:text-base ${
            ctaDocked ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden={ctaDocked}
        >
          <span className="acb-hero-trust-line block font-semibold">
            Kayıt yok
          </span>
          <span className="acb-hero-trust-line block text-slate-600">
            2 dakikada 5+ teklif al
          </span>
          <span className="acb-hero-trust-line block font-semibold text-[var(--acb-green)]">
            En uygunu seç.
          </span>
        </p>
      </div>

      {/* 4. En Alt Bölüm: Chevron yukarı bakan Hakkında butonu */}
      <div
        className={`shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center transition-all duration-600 delay-150 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isContentVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6 pointer-events-none"
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
      </div>
    </section>
  );
}

