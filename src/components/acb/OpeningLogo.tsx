"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ACB_BRAND } from "@/lib/brand";
import { ACB_SHELL_MAX_W } from "@/lib/design-tokens";

export const OPENING_LOGO_SRC = ACB_BRAND.logoOpening;

export function OpeningLogo({
  forceDocked = false,
  scrollDock = false,
  onClick,
  onDockedChange,
  leading,
  center,
  trailing,
  offsetY = 0,
}: {
  forceDocked?: boolean;
  scrollDock?: boolean;
  heroReady?: boolean;
  onClick?: () => void;
  onDockedChange?: (docked: boolean) => void;
  leading?: ReactNode;
  center?: ReactNode;
  trailing?: ReactNode;
  offsetY?: number;
}) {
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    if (!scrollDock || forceDocked) {
      setDocked(false);
      return;
    }
    const handleScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setDocked(y > 180);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollDock, forceDocked]);

  const chromeDocked = forceDocked || docked;
  const showSpacer = forceDocked;

  useEffect(() => {
    onDockedChange?.(chromeDocked);
  }, [chromeDocked, onDockedChange]);

  return (
    <>
      <div
        className={`pointer-events-none ${showSpacer ? "h-[5.75rem] sm:h-[6.25rem]" : "h-0"}`}
        aria-hidden
        id={showSpacer ? "app-shell-header" : undefined}
      />

      <div
        className={`pointer-events-none fixed inset-x-3 top-[max(0.5rem,env(safe-area-inset-top))] z-50 flex justify-center transition-all duration-300 ease-out ${
          chromeDocked ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transform: offsetY ? `translateY(${offsetY}px)` : undefined,
          transition: "transform 0.32s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease-out",
        }}
      >
        <div
          className={`acb-chrome-bar pointer-events-auto flex w-full ${ACB_SHELL_MAX_W} items-center justify-between gap-2.5 rounded-[var(--acb-radius)] px-3 py-2.5`}
        >
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={onClick}
              aria-label="Acil Çözüm Bul — ana sayfa"
              className="flex shrink-0 items-center gap-2 touch-manipulation cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={OPENING_LOGO_SRC}
                alt="Acil Çözüm Bul"
                width={100}
                height={100}
                decoding="async"
                className="size-9 object-contain"
              />
            </button>
            {chromeDocked && center ? (
              <div className="min-w-0 flex items-center">
                {center}
              </div>
            ) : null}
          </div>
          <div className="flex shrink-0 min-h-9 items-center justify-end gap-1.5">
            {trailing}
          </div>
        </div>
      </div>

      {!forceDocked ? (
        <div className="pt-[max(1rem,env(safe-area-inset-top))] pb-3 flex justify-center">
          <button
            type="button"
            onClick={onClick}
            aria-label="Acil Çözüm Bul — ana sayfa"
            className="touch-manipulation cursor-pointer active:scale-95 transition-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={OPENING_LOGO_SRC}
              alt="Acil Çözüm Bul"
              width={2000}
              height={2002}
              decoding="async"
              fetchPriority="high"
              className="h-28 w-28 sm:h-36 sm:w-36 object-contain"
            />
          </button>
        </div>
      ) : null}
    </>
  );
}
