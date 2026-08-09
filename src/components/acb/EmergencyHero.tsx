"use client";

import Link from "next/link";
import { ChevronUp } from "lucide-react";
import { Btn, Spinner } from "@/components/ui";
import { ACB_CTA } from "@/lib/design-tokens";
import { ACB_ICON_STROKE } from "@/lib/acb-icons";

/**
 * Emergency entry — one job: ask for help.
 * Brand mark is handled by OpeningLogo (morphs into the top nav).
 */
export function EmergencyHero({
  onYardimAl,
  yukleniyor = false,
  disabled = false,
}: {
  onYardimAl: () => void;
  yukleniyor?: boolean;
  disabled?: boolean;
}) {
  return (
    <section className="relative flex min-h-[calc(100dvh-1rem)] flex-col animate-fade-in">
      {/* Room for the floating hero logo */}
      <div className="h-[min(42vw,11.5rem)] shrink-0 sm:h-48" aria-hidden />

      <div className="flex flex-1 flex-col justify-center space-y-6 pb-4">
        <div className="space-y-3 text-center">
          <h1 className="text-[2.35rem] font-bold leading-[1.05] tracking-tight text-[var(--acb-dark)] sm:text-5xl">
            Yolda mı kaldın?
          </h1>
          <p className="mx-auto max-w-[18rem] text-lg font-medium leading-snug text-[var(--acb-muted)] sm:text-xl sm:max-w-sm">
            En yakın yardımı bulalım.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Btn
            type="button"
            variant="primary"
            onClick={onYardimAl}
            disabled={disabled || yukleniyor}
            className="!min-h-[3.5rem] !text-base !font-bold !tracking-wide shadow-[var(--acb-shadow-cta)]"
          >
            {yukleniyor ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner className="size-4 border-white/40 border-t-white" />
                Hazırlanıyor…
              </span>
            ) : (
              ACB_CTA.acilYardim
            )}
          </Btn>
          <div className="flex justify-center">
            <Link
              href="/cekici-fiyat-hesaplama"
              className="inline-flex min-h-[var(--acb-touch)] items-center px-3 text-sm font-medium text-[var(--acb-muted)] underline-offset-4 hover:underline touch-manipulation"
            >
              {ACB_CTA.fiyatHesapla}
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <a
          href="#nasil-calisir"
          className="acb-scroll-hint group flex flex-col items-center gap-1 py-2 text-slate-400 touch-manipulation hover:text-slate-500"
        >
          <ChevronUp
            className="size-5"
            strokeWidth={ACB_ICON_STROKE}
            aria-hidden
          />
          <span className="text-[11px] font-medium tracking-wide">
            Acil Çözüm Bul Hakkında
          </span>
        </a>
        <p className="text-center text-xs leading-relaxed text-[var(--acb-muted)]">
          Kayıt yok · Ücretsiz talep · Teklifi sen seç
        </p>
      </div>
    </section>
  );
}
