"use client";

import { ChevronDown } from "lucide-react";
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
    <section className="relative flex h-[100dvh] max-h-[100dvh] flex-col animate-fade-in">
      {/* Band reserved for floating hero logo (synced with --acb-hero-logo-band) */}
      <div
        id="acb-hero-logo-band"
        className="shrink-0"
        style={{ height: "var(--acb-hero-logo-band)" }}
        aria-hidden
      />

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Logo altı: başlık → CTA yuvası → trust satırları */}
        <div className="shrink-0 pt-1">
          <div className="text-center">
            <h1
              id="acb-hero-baslik"
              className="acb-display text-[2.15rem] font-bold text-[var(--acb-dark)] sm:text-[2.85rem]"
            >
              Yolda mı kaldın?
            </h1>
          </div>

          <div className="mt-3 flex flex-col items-stretch">
            <p className="mx-auto max-w-[17.5rem] text-center text-[1.0625rem] font-medium leading-snug tracking-[0.01em] text-[var(--acb-muted)] sm:max-w-sm sm:text-xl">
              En yakın yardımı bulalım.
            </p>

            {/* Layout + dock ölçümü — gerçek buton OpeningLogo’da morph eder */}
            <div
              id="acb-hero-yardim-cta"
              className="my-7 min-h-[3.6rem] w-full"
              aria-hidden
            />

            <p
              className={`acb-hero-trust space-y-1 text-center text-[0.9375rem] font-medium leading-snug tracking-[0.01em] transition-opacity duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] sm:text-base ${
                ctaDocked ? "opacity-0" : "opacity-100"
              }`}
              aria-hidden={ctaDocked}
            >
              <span className="acb-hero-trust-line block">Kayıt yok</span>
              <span className="acb-hero-trust-line block">
                2 dakikada 5+ teklif al
              </span>
              <span className="acb-hero-trust-line block">En uygunu seç.</span>
            </p>
          </div>
        </div>

        {/* «En uygunu seç» ile ekran altı arasının ortası */}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <a
            href="#nasil-calisir"
            className="acb-scroll-hint group flex flex-col items-center gap-1 py-2 text-[var(--acb-muted)] touch-manipulation active:opacity-70"
          >
            <ChevronDown
              className="size-5"
              strokeWidth={ACB_ICON_STROKE}
              aria-hidden
            />
            <span className="text-[11px] font-medium tracking-[0.04em]">
              Acil Çözüm Bul Hakkında
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
