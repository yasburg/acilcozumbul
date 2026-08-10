"use client";

import { ChevronUp } from "lucide-react";
import { ACB_ICON_STROKE } from "@/lib/acb-icons";

/**
 * Emergency entry — one job: ask for help.
 * Brand mark + YARDIM AL are handled by OpeningLogo (morph into the top nav).
 * `ctaDocked` fades trust lines once the CTA has moved into the header.
 */
export function EmergencyHero({
  ctaDocked = false,
}: {
  /** True when YARDIM AL has moved into the sticky header */
  ctaDocked?: boolean;
}) {
  return (
    <section className="relative flex h-[100dvh] max-h-[100dvh] w-full flex-col justify-between overflow-hidden animate-fade-in">
      {/* 1. Üst Bölüm: Logo bandı + Başlık + Altbaşlık (üst yarıda ortalı) */}
      <div className="flex flex-1 flex-col items-center justify-center text-center pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div
          id="acb-hero-logo-band"
          className="shrink-0"
          style={{ height: "var(--acb-hero-logo-band)" }}
          aria-hidden
        />
        <div className="mt-1 px-4">
          <h1
            id="acb-hero-baslik"
            className="acb-display text-[2.15rem] font-bold text-[var(--acb-dark)] sm:text-[2.85rem]"
          >
            Yolda mı kaldın?
          </h1>
          <p className="mt-2.5 mx-auto max-w-[17.5rem] text-center text-[1.0625rem] font-medium leading-snug tracking-[0.01em] text-[var(--acb-muted)] sm:max-w-sm sm:text-xl">
            En yakın yardımı bulalım.
          </p>
        </div>
      </div>

      {/* 2. Orta Bölüm: Ekranın tam ortası (50% / 50vh) - YARDIM AL Buton Yuvası */}
      <div className="shrink-0 w-full max-w-md mx-auto px-4 py-1">
        <div
          id="acb-hero-yardim-cta"
          className="min-h-[3.6rem] w-full"
          aria-hidden
        />
      </div>

      {/* 3. Alt Bölüm: Ekranın 3/4 noktası (~75% / 75vh) - Güven metinleri */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <p
          className={`acb-hero-trust space-y-1 text-center text-[0.9375rem] font-medium leading-snug tracking-[0.01em] transition-opacity duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] sm:text-base ${
            ctaDocked ? "opacity-0" : "opacity-100"
          }`}
          aria-hidden={ctaDocked}
        >
          <span className="acb-hero-trust-line block font-semibold text-[var(--acb-primary)]">
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
      <div className="shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center">
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

