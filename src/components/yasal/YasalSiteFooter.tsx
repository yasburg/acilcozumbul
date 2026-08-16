"use client";

import Link from "next/link";
import {
  OdemeKartLogolari,
  YerliUretimLogo,
} from "@/components/yasal/OdemeKartLogolari";
import { SosyalMedyaIkonlari } from "@/components/yasal/SosyalMedyaIkonlari";
import { ACB_BRAND } from "@/lib/brand";
import { YASAL_LINKLER } from "@/lib/yasal-sirket";

const PLATFORM_LINKLER = [
  { href: "/cekici-fiyat-hesaplama", label: "Çekici fiyat hesaplama" },
  { href: "/is-birligi", label: "İş birliği" },
  { href: "/hizmet-veren", label: "Hizmet veren ol" },
] as const;

const YASAL_FOOTER_LINKLER = YASAL_LINKLER.map((l) => ({
  href: l.href,
  label: l.label.replace(" (KVKK)", ""),
}));

const linkSinif =
  "text-[13px] leading-snug text-slate-500 transition-colors hover:text-[var(--acb-dark)]";

export function YasalSiteFooter() {
  const yil = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--acb-border)] bg-white px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 touch-manipulation group"
            aria-label="Acil Çözüm Bul — ana sayfa"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ACB_BRAND.animationPingpong}
              alt="Acil Çözüm Bul"
              width={1920}
              height={1920}
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-contain shrink-0"
            />
            <span className="text-sm sm:text-base font-medium leading-snug text-[var(--acb-muted)] group-hover:text-[var(--acb-dark)] transition-colors max-w-[20ch] sm:max-w-none">
              Türkiye’nin acil yol yardım platformu
            </span>
          </Link>
          <SosyalMedyaIkonlari className="!justify-end shrink-0" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-8">
          <nav aria-label="Platform">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--acb-dark)]">
              Platform
            </p>
            <ul className="mt-3.5 space-y-2.5">
              {PLATFORM_LINKLER.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkSinif}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Yasal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--acb-dark)]">
              Yasal
            </p>
            <ul className="mt-3.5 space-y-2.5">
              {YASAL_FOOTER_LINKLER.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkSinif}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-[var(--acb-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--acb-muted)]">
            © {yil} YSN LABS · Tüm hakları saklıdır
          </p>
          <div className="flex flex-wrap items-center gap-3 opacity-80">
            <YerliUretimLogo className="h-4 w-auto shrink-0" />
            <OdemeKartLogolari />
          </div>
        </div>
      </div>
    </footer>
  );
}
