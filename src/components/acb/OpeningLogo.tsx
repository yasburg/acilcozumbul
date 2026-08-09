"use client";

import { useEffect, useState, type ReactNode } from "react";

export const OPENING_LOGO_SRC = "/brand/acb/opening-logo.png";

const DOCK_AT = 72;
const UNDOCK_AT = 28;

/**
 * Shared opening logo — large on entry, morphs to compact top mark
 * when the user scrolls (or leaves the entry step).
 */
export function OpeningLogo({
  forceDocked = false,
  scrollDock = false,
  onClick,
  leading,
  trailing,
}: {
  /** Always docked (wizard steps after entry) */
  forceDocked?: boolean;
  /** On entry screen: dock when page is scrolled */
  scrollDock?: boolean;
  onClick?: () => void;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!scrollDock || forceDocked) {
      setScrolled(false);
      return;
    }

    let raf = 0;
    const sync = () => {
      raf = 0;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setScrolled((prev) => {
        if (prev) return y > UNDOCK_AT;
        return y > DOCK_AT;
      });
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [scrollDock, forceDocked]);

  const docked = forceDocked || scrolled;

  return (
    <>
      <div
        className={`pointer-events-none transition-[height] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          docked ? "h-[3.75rem]" : "h-0"
        }`}
        aria-hidden
        id={docked ? "app-shell-header" : undefined}
      />

      {/* Soft bar behind docked mark so content never fights the logo */}
      <div
        className={`pointer-events-none fixed inset-x-0 top-0 z-40 transition-opacity duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
          docked ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      >
        <div className="h-[calc(3.5rem+env(safe-area-inset-top))] bg-white/92 backdrop-blur-md border-b border-[var(--acb-border)]" />
      </div>

      {docked ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-[max(0.4rem,env(safe-area-inset-top))]">
          <div className="pointer-events-auto flex w-full max-w-lg items-center gap-2">
            <div className="flex min-w-[2.75rem] shrink-0 justify-start">
              {leading}
            </div>
            <div className="flex min-w-0 flex-1 justify-center">
              <div className="size-11" aria-hidden />
            </div>
            <div className="flex min-w-[2.75rem] shrink-0 justify-end">
              {trailing}
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onClick}
        aria-label="Acil Çözüm Bul — ana sayfa"
        className={`acb-opening-logo touch-manipulation ${
          docked ? "acb-opening-logo--nav" : "acb-opening-logo--hero"
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
