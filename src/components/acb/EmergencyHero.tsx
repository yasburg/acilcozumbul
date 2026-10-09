"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";
import { ACB_ICON_STROKE } from "@/lib/acb-icons";
import { Btn } from "@/components/ui";

const TITLE_FULL = "Yolda mı kaldın?";
const SUBTITLE_TEXT = "Acil çözüm bulalım.";
const SESSION_KEY = "acb_hero_typewriter_seen_v7";
const TYPE_MS = 1470;

/**
 * Homepage hero — main visual structure.
 * Choreography is CSS-driven so remount/Strict Mode cannot leave a blank caret
 * or forever-hidden CTA (the JS timer race that broke main’s typewriter).
 */
export function EmergencyHero({
  onHeroReady,
  onYardimAl,
}: {
  onHeroReady?: (ready: boolean) => void;
  onYardimAl?: () => void;
}) {
  const [variant, setVariant] = useState<"intro" | "return">("intro");
  const onHeroReadyRef = useRef(onHeroReady);
  onHeroReadyRef.current = onHeroReady;
  const readySent = useRef(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (seen) setVariant("return");
    onHeroReadyRef.current?.(false);

    const readyAt = seen ? 100 : TYPE_MS + 700;
    const readyTimer = window.setTimeout(() => {
      if (readySent.current) return;
      readySent.current = true;
      onHeroReadyRef.current?.(true);
    }, readyAt);

    const seenTimer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
    }, seen ? 650 : TYPE_MS + 1250);

    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(seenTimer);
    };
  }, []);

  const isIntro = variant === "intro";

  return (
    <section
      className={`acb-hero relative flex h-[calc(100dvh-8.75rem-env(safe-area-inset-top))] sm:h-[calc(100dvh-10.75rem)] max-h-[calc(100dvh-8.75rem-env(safe-area-inset-top))] w-full flex-col justify-between overflow-hidden animate-fade-in px-4 pt-1 pb-[max(0.75rem,calc(env(safe-area-inset-bottom)+0.25rem))] ${
        isIntro ? "acb-hero--intro" : "acb-hero--return"
      }`}
    >
      <div className="flex flex-1 flex-col items-center justify-center text-center pb-6 sm:pb-10">
        <div className="w-full max-w-md mx-auto space-y-2">
          <h1
            id="acb-hero-baslik"
            className="acb-display text-[2.45rem] sm:text-[3.25rem] font-bold tracking-tight text-[var(--acb-dark)] leading-[1.12]"
          >
            {isIntro ? (
              <span className="acb-hero-type-wrap">
                <span className="acb-hero-type">{TITLE_FULL}</span>
              </span>
            ) : (
              TITLE_FULL
            )}
          </h1>
          <p className="acb-hero-subtitle mx-auto max-w-[20rem] sm:max-w-md text-center text-[1.1875rem] sm:text-[1.375rem] font-medium leading-snug tracking-[0.01em] text-[var(--acb-muted)]">
            {SUBTITLE_TEXT}
          </p>
        </div>
      </div>

      <div className="acb-hero-cta absolute top-1/2 left-1/2 w-full max-w-sm sm:max-w-md px-4 text-center z-10">
        <Btn
          type="button"
          variant="primary"
          onClick={onYardimAl}
          className="w-full !font-bold !tracking-wider text-base sm:text-lg"
        >
          YARDIM AL
        </Btn>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center pt-6 sm:pt-10">
        <div className="acb-hero-trust space-y-1.5 text-center text-sm sm:text-base leading-snug tracking-[0.01em]">
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

      <div className="acb-hero-about shrink-0 text-center">
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
