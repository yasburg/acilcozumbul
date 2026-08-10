"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ACB_BRAND } from "@/lib/brand";
import { ACB_CTA } from "@/lib/design-tokens";
import { prefersReducedMotion } from "@/lib/apple-motion";

export const OPENING_LOGO_SRC = ACB_BRAND.logoOpening;

/** Fallback eşikler (DOM ölçümü gelmeden) */
const FALLBACK = {
  logoDockAt: 56,
  logoUndockAt: 12,
};

type Thresholds = typeof FALLBACK;

function scrollY(): number {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

function safeAreaTop(): number {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;left:0;height:env(safe-area-inset-top);pointer-events:none;visibility:hidden";
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height;
  probe.remove();
  return h || 0;
}

/**
 * Hero CTA viewport konumunu CSS değişkenlerine yaz.
 * Logo gibi sabit iki uç → CSS transition; scroll’daki kayan slot yok.
 */
function syncHeroCtaCssVars() {
  if (scrollY() > 8) return;
  const slot = document.getElementById("acb-hero-yardim-cta");
  if (!slot) return;
  const r = slot.getBoundingClientRect();
  if (r.width < 2 || r.height < 2 || r.top < 0) return;
  const root = document.documentElement;
  root.style.setProperty("--acb-hero-cta-top", `${r.top}px`);
  root.style.setProperty("--acb-hero-cta-left", `${r.left}px`);
  root.style.setProperty("--acb-hero-cta-width", `${r.width}px`);
  root.style.setProperty("--acb-hero-cta-height", `${r.height}px`);
}

function clearCtaInlineStyles(el: HTMLElement | null) {
  if (!el) return;
  el.style.top = "";
  el.style.left = "";
  el.style.width = "";
  el.style.height = "";
  el.style.transition = "";
  el.classList.remove("acb-morph-tracking");
}

function measureThresholds(): Thresholds {
  const y = scrollY();
  const logo = document.querySelector(".acb-opening-logo");
  const baslik = document.getElementById("acb-hero-baslik");

  let logoDockAt = FALLBACK.logoDockAt;
  if (baslik && logo instanceof HTMLElement) {
    const gap =
      baslik.getBoundingClientRect().top - logo.getBoundingClientRect().bottom;
    logoDockAt = Math.max(24, Math.round(y + gap - 8));
  }

  return {
    logoDockAt,
    logoUndockAt: Math.max(0, logoDockAt - 44),
  };
}

/**
 * Logo + YARDIM AL — ikisi de CSS class morph (hero ↔ nav).
 * Tek dock eşiği; yukarı snap’te undock scroll ile aynı anda başlar.
 */
export function OpeningLogo({
  forceDocked = false,
  scrollDock = false,
  onClick,
  onDockedChange,
  onYardimAl,
  leading,
  center,
  trailing,
}: {
  forceDocked?: boolean;
  scrollDock?: boolean;
  onClick?: () => void;
  onDockedChange?: (docked: boolean) => void;
  onYardimAl?: () => void;
  leading?: ReactNode;
  center?: ReactNode;
  trailing?: ReactNode;
}) {
  const [docked, setDocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const thresholds = useRef<Thresholds>({ ...FALLBACK });
  const yardimCtaRef = useRef<HTMLButtonElement>(null);
  const autoScrolledRef = useRef(false);
  const programmaticUntil = useRef(0);
  const lastScrollY = useRef(0);
  const hasYardimAl = Boolean(onYardimAl);

  function scrollProgrammatic(top: number, holdMs = 900) {
    programmaticUntil.current = performance.now() + holdMs;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  function nasilCalisirScrollTop(): number | null {
    const target = document.getElementById("nasil-calisir");
    if (!target) return null;
    const headerOffset = safeAreaTop() + 72;
    return target.getBoundingClientRect().top + scrollY() - headerOffset;
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!scrollDock || forceDocked) {
      setDocked(false);
      return;
    }

    let raf = 0;
    let dockedLocal = false;
    let snappingToTop = false;

    const syncAll = () => {
      raf = 0;
      const y = scrollY();
      const prevY = lastScrollY.current;
      lastScrollY.current = y;

      if (y <= 8 && !dockedLocal) {
        thresholds.current = measureThresholds();
        syncHeroCtaCssVars();
      }

      const th = thresholds.current;

      if (snappingToTop) {
        if (dockedLocal) {
          dockedLocal = false;
          setDocked(false);
          clearCtaInlineStyles(yardimCtaRef.current);
        }
        if (y <= 8) {
          snappingToTop = false;
          autoScrolledRef.current = false;
          syncHeroCtaCssVars();
          clearCtaInlineStyles(yardimCtaRef.current);
        }
      } else {
        const nextDocked = dockedLocal
          ? y > th.logoUndockAt
          : y >= th.logoDockAt;
        if (nextDocked !== dockedLocal) {
          dockedLocal = nextDocked;
          setDocked(nextDocked);
          // Inline stil kalmışsa CSS morph’u bozar
          clearCtaInlineStyles(yardimCtaRef.current);
        }
      }

      if (performance.now() >= programmaticUntil.current && !snappingToTop) {
        const sectionTop = nasilCalisirScrollTop();
        if (sectionTop != null && y >= sectionTop - 12) {
          autoScrolledRef.current = true;
        }
        const goingUp = y < prevY - 1;
        if (
          sectionTop != null &&
          goingUp &&
          autoScrolledRef.current &&
          prevY >= sectionTop - 20 &&
          y < sectionTop - 20 &&
          y > 8
        ) {
          autoScrolledRef.current = false;
          snappingToTop = true;
          // Logo + CTA hemen hero class’ına — CSS header→orta morph
          if (dockedLocal) {
            dockedLocal = false;
            setDocked(false);
            clearCtaInlineStyles(yardimCtaRef.current);
          }
          scrollProgrammatic(0, 1100);
        }
        if (y <= 8) {
          autoScrolledRef.current = false;
        }
      }
    };

    thresholds.current = measureThresholds();
    syncHeroCtaCssVars();
    clearCtaInlineStyles(yardimCtaRef.current);
    lastScrollY.current = scrollY();
    syncAll();

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(syncAll);
    };

    const onResize = () => {
      if (scrollY() <= 8 && !dockedLocal) {
        thresholds.current = measureThresholds();
        syncHeroCtaCssVars();
      }
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [scrollDock, forceDocked, mounted, hasYardimAl]);

  const chromeDocked = forceDocked || (mounted && docked);
  const showSpacer = forceDocked;
  const showMorphCta = Boolean(scrollDock && !forceDocked && hasYardimAl);

  useEffect(() => {
    onDockedChange?.(chromeDocked);
  }, [chromeDocked, onDockedChange]);

  useEffect(() => {
    if (!scrollDock || forceDocked) {
      autoScrolledRef.current = false;
      return;
    }
    if (!docked) return;
    if (autoScrolledRef.current) return;

    const timer = window.setTimeout(() => {
      const top = nasilCalisirScrollTop();
      if (top == null) return;
      if (scrollY() >= top - 12) {
        autoScrolledRef.current = true;
        return;
      }
      autoScrolledRef.current = true;
      scrollProgrammatic(top);
    }, 60);

    return () => window.clearTimeout(timer);
  }, [docked, scrollDock, forceDocked]);

  return (
    <>
      <div
        className={`pointer-events-none ${showSpacer ? "h-[4.75rem]" : "h-0"}`}
        aria-hidden
        id={showSpacer ? "app-shell-header" : undefined}
      />

      <div
        className={`pointer-events-none fixed inset-x-0 top-0 z-40 transition-opacity duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
          chromeDocked ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      >
        <div className="acb-chrome-bar h-[calc(4.5rem+env(safe-area-inset-top))]" />
      </div>

      <div
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-[max(0.55rem,env(safe-area-inset-top))] transition-opacity duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
          chromeDocked ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="pointer-events-auto flex w-full max-w-lg items-center gap-2.5">
          <div
            className={`flex shrink-0 items-center justify-start ${
              leading
                ? "max-w-[min(100%,11.5rem)]"
                : showMorphCta
                  ? "h-11 w-[5.75rem]"
                  : "size-11"
            }`}
          >
            {leading}
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center">
            {chromeDocked ? center : null}
          </div>
          <div className="flex min-h-11 shrink-0 items-center justify-end gap-1.5">
            {trailing}
          </div>
        </div>
      </div>

      {/* Logo ile aynı model: yalnızca class değişir → CSS morph */}
      {showMorphCta ? (
        <button
          ref={yardimCtaRef}
          type="button"
          onClick={onYardimAl}
          className={`acb-yardim-cta touch-manipulation ${
            chromeDocked ? "acb-yardim-cta--nav" : "acb-yardim-cta--hero"
          }`}
          aria-label={ACB_CTA.acilYardim}
        >
          {ACB_CTA.acilYardim}
        </button>
      ) : null}

      <button
        type="button"
        onClick={onClick}
        aria-label="Acil Çözüm Bul — ana sayfa"
        className={`acb-opening-logo touch-manipulation ${
          chromeDocked ? "acb-opening-logo--nav" : "acb-opening-logo--hero"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={OPENING_LOGO_SRC}
          alt="Acil Çözüm Bul"
          width={2000}
          height={2002}
          decoding="async"
          fetchPriority="high"
          className="block h-full w-full object-contain"
        />
      </button>
    </>
  );
}
