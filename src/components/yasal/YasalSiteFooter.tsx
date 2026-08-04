import Link from "next/link";
import { BrandLogoYazili } from "@/components/BrandLogo";
import {
  OdemeKartLogolari,
  YerliUretimLogo,
} from "@/components/yasal/OdemeKartLogolari";
import { SosyalMedyaIkonlari } from "@/components/yasal/SosyalMedyaIkonlari";
import { YASAL_LINKLER } from "@/lib/yasal-sirket";

const FOOTER_LINKLER = [
  { href: "/cekici-fiyat-hesaplama", label: "Çekici fiyat hesaplama" },
  { href: "/is-birligi", label: "İş birliği" },
  { href: "/hizmet-veren", label: "Hizmet veren ol" },
  ...YASAL_LINKLER.map((l) => ({
    href: l.href,
    label: l.label.replace(" (KVKK)", ""),
  })),
] as const;

export function YasalSiteFooter() {
  const yil = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 px-4 py-4">
      <div className="mx-auto max-w-3xl space-y-3">
        {/* Üst: logo + slogan | sosyal */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <BrandLogoYazili className="h-8 w-auto max-w-[170px] object-contain object-left" />
            <p className="mt-0.5 text-[11px] font-medium leading-tight text-slate-800 sm:text-xs">
              Türkiye’nin acil yol yardım platformu
            </p>
          </div>
          <SosyalMedyaIkonlari className="!justify-end shrink-0" />
        </div>

        <div className="border-t border-slate-200/80" />

        {/* Orta: linkler */}
        <nav
          className="flex flex-wrap gap-x-2.5 gap-y-1 text-[11px] leading-snug text-slate-600"
          aria-label="Site bağlantıları"
        >
          {FOOTER_LINKLER.map((l, i) => (
            <span key={l.href} className="inline-flex items-center gap-2.5">
              {i > 0 && <span className="text-slate-300" aria-hidden>|</span>}
              <Link
                href={l.href}
                className="hover:text-amber-700 underline-offset-2 hover:underline"
              >
                {l.label}
              </Link>
            </span>
          ))}
        </nav>

        <div className="border-t border-slate-200/80" />

        {/* Alt: yerli üretim | telif | ödeme */}
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <YerliUretimLogo className="h-5 w-auto shrink-0" />
          <p className="order-last w-full text-center text-[10px] text-slate-500 sm:order-none sm:w-auto sm:flex-1">
            YSN LABS YAZILIM {yil} — tüm hakları saklıdır.
          </p>
          <OdemeKartLogolari className="justify-end" />
        </div>
      </div>
    </footer>
  );
}
