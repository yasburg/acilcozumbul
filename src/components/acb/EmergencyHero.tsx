"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { ACB_ICON_STROKE } from "@/lib/acb-icons";
import { Btn } from "@/components/ui";

const TITLE_FULL = "Yolda mı kaldın?";
const SUBTITLE_TEXT = "Acil çözüm bulalım.";
const SESSION_KEY = "acb_hero_typewriter_seen";

/**
 * Emergency entry hero.
 * Features a clean typewriter intro sequence on first visit,
 * and a smooth reveal of the main YARDIM AL button.
 */
export function EmergencyHero({
  onHeroReady,
  onYardimAl,
}: {
  /** Callback when hero intro finishes or is already ready */
  onHeroReady?: (ready: boolean) => void;
  onYardimAl?: () => void;
}) {
  const [stage, setStage] = useState<"typing" | "subtitle" | "short_intro" | "sliding" | "ready">("typing");
  const [typedIndex, setTypedIndex] = useState(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setStage("short_intro");
        onHeroReady?.(false);
        return;
      }
    } catch {
      /* ignore */
    }

    setStage("typing");
    onHeroReady?.(false);
    setTypedIndex(0);
  }, [onHeroReady]);

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
  const isContentVisible = stage === "sliding" || stage === "ready";

  return (
    <section className="relative flex h-[calc(100dvh-8.75rem-env(safe-area-inset-top))] sm:h-[calc(100dvh-10.75rem)] max-h-[calc(100dvh-8.75rem-env(safe-area-inset-top))] w-full flex-col justify-between overflow-hidden animate-fade-in px-4 pt-1 pb-[max(0.75rem,calc(env(safe-area-inset-bottom)+0.25rem))]">
      {/* 1. Üst Bölüm: Başlık + Altbaşlık */}
      <div className="flex flex-1 flex-col items-center justify-center text-center pb-6 sm:pb-10">
        <div className="w-full max-w-md mx-auto space-y-2">
          <h1
            id="acb-hero-baslik"
            className="acb-display text-[2.45rem] sm:text-[3.25rem] font-bold tracking-tight text-[var(--acb-dark)] leading-[1.12]"
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
            className={`mx-auto max-w-[20rem] sm:max-w-md text-center text-[1.1875rem] sm:text-[1.375rem] font-medium leading-snug tracking-[0.01em] text-[var(--acb-muted)] transition-all duration-400 ease-out ${
              isSubtitleVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            {SUBTITLE_TEXT}
          </p>
        </div>
      </div>

      {/* 2. SAYFANIN TAM DIKEY ORTASI (50vh Center): YARDIM AL Butonu (Birebir aynı Btn bileşeni) */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm sm:max-w-md px-4 text-center z-10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isContentVisible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <Btn
          type="button"
          variant="primary"
          onClick={onYardimAl}
          className="w-full !font-bold !tracking-wider text-base sm:text-lg"
        >
          YARDIM AL
        </Btn>
      </div>

      {/* 3. Alt Orta Bölüm: 3 Satır Güven Metni */}
      <div className="flex flex-1 flex-col items-center justify-center text-center pt-6 sm:pt-10">
        <div
          className={`acb-hero-trust space-y-1.5 text-center text-sm sm:text-base leading-snug tracking-[0.01em] transition-all duration-600 delay-75 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isContentVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <span className="acb-hero-trust-line block font-semibold">
            Kayıt yok
          </span>
          <span className="acb-hero-trust-line block font-medium">
            2 dakikada 5+ teklif al
          </span>
          <span className="acb-hero-trust-line block font-bold">
            En uygunu seç.
          </span>
        </div>
      </div>

      {/* 4. SAYFANIN EN ALTI: Chevron yukarı bakan Hakkında linki */}
      <div
        className={`shrink-0 text-center transition-all duration-600 delay-150 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isContentVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <a
          href="#nasil-calisir"
          className="acb-scroll-hint group inline-flex flex-col items-center gap-0.5 py-1 text-[var(--acb-muted)] touch-manipulation active:opacity-70"
        >
          <ChevronUp
            className="size-4"
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
