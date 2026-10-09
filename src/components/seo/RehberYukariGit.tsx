"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { ACB_ICON_STROKE } from "@/lib/acb-icons";

/** ~viewport üstü; tepede sürekli görünmesin */
const SCROLL_ESIGI_PX = 320;

/**
 * Rehber sayfalarında alt orta “Yukarı git” — scroll sonrası belirir.
 * Çerez şeridi / safe-area üstüne kalkar (`--acil-sticky-cta-h` varsa onu da hesaba katar).
 */
export function RehberYukariGit() {
  const [gorunur, setGorunur] = useState(false);

  useEffect(() => {
    const guncelle = () => {
      setGorunur(window.scrollY > SCROLL_ESIGI_PX);
    };
    guncelle();
    window.addEventListener("scroll", guncelle, { passive: true });
    return () => window.removeEventListener("scroll", guncelle);
  }, []);

  const yukariGit = () => {
    const azalt = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: azalt ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={yukariGit}
      aria-label="Yukarı git"
      tabIndex={gorunur ? 0 : -1}
      className={`acb-chrome-bar fixed z-40 flex size-11 items-center justify-center rounded-full text-[var(--acb-dark)] left-1/2 -translate-x-1/2 touch-manipulation transition-[opacity,transform,border-color] duration-200 ease-out hover:border-amber-300/70 active:scale-[0.96] ${
        gorunur
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
      style={{
        bottom:
          "max(1.25rem, calc(var(--acil-sticky-cta-h, 0px) + env(safe-area-inset-bottom, 0px) + 4.25rem))",
      }}
    >
      <ChevronUp className="size-5" strokeWidth={ACB_ICON_STROKE} aria-hidden />
    </button>
  );
}
