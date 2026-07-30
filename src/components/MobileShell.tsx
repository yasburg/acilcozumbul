import Link from "next/link";
import { BrandLogoYazili } from "@/components/BrandLogo";

interface MobileShellProps {
  children: React.ReactNode;
  subtitle?: string;
  /** Müşteri akışında sağ; çekici panelinde varsayılan orta */
  subtitleAlign?: "center" | "right";
  showBrand?: boolean;
  backHref?: string;
  /** Geri okunun yanında görünen metin (ör. İptal) */
  backLabel?: string;
  /** Sayfa içi geri (href yerine); wizard adımları için */
  onBack?: () => void;
  /** Header ortasında, subtitle üstünde (ör. demo ikonu) */
  headerBadge?: React.ReactNode;
  footer?: React.ReactNode;
}

export function MobileShell({
  children,
  subtitle,
  subtitleAlign = "center",
  showBrand = true,
  backHref,
  backLabel,
  onBack,
  headerBadge,
  footer,
}: MobileShellProps) {
  const geriSinif = `flex shrink-0 items-center gap-1 rounded-full bg-slate-100 text-slate-700 touch-manipulation ${
    backLabel
      ? "px-3 py-2 text-sm font-medium"
      : "h-8 w-8 justify-center text-base"
  }`;
  const geriAria = backLabel ? `${backLabel}, geri` : "Geri";
  const geriIcerik = (
    <>
      <span aria-hidden>←</span>
      {backLabel ? <span>{backLabel}</span> : null}
    </>
  );

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 text-slate-900">
      <header
        id="app-shell-header"
        className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-md px-3 py-2 shadow-sm"
      >
        <div
          className={[
            "flex min-h-[3.9rem] items-center max-w-lg mx-auto",
            subtitleAlign === "right" ? "justify-between gap-2" : "relative",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center gap-1.5",
              subtitleAlign === "center" ? "relative z-10" : "min-w-0 shrink-0",
            ].join(" ")}
          >
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className={geriSinif}
                aria-label={geriAria}
              >
                {geriIcerik}
              </button>
            ) : backHref ? (
              <Link
                href={backHref}
                className={geriSinif}
                aria-label={geriAria}
              >
                {geriIcerik}
              </Link>
            ) : null}
            {showBrand && (
              <BrandLogoYazili
                priority
                className="h-[3.9rem] w-auto max-w-[min(312px,82vw)] shrink-0 object-contain object-left"
              />
            )}
          </div>
          {subtitle && (
            <div
              className={[
                "pointer-events-none absolute inset-x-0 flex flex-col items-center justify-center gap-0.5 px-28",
                subtitleAlign === "right" ? "hidden" : "",
              ].join(" ")}
            >
              {headerBadge}
              <p className="text-[14.3px] leading-snug font-medium text-slate-600 line-clamp-3 text-center">
                {subtitle}
              </p>
            </div>
          )}
          {!subtitle && headerBadge && subtitleAlign === "center" && (
            <div className="pointer-events-none absolute inset-x-0 flex justify-center px-28">
              {headerBadge}
            </div>
          )}
          {subtitle && subtitleAlign === "right" && (
            <p className="max-w-[46%] shrink-0 text-right text-[14.3px] leading-snug font-medium text-slate-600 line-clamp-3">
              {subtitle}
            </p>
          )}
        </div>
      </header>
      <main className="flex-1 px-4 py-5 pb-24 max-w-lg mx-auto w-full">{children}</main>
      {footer}
    </div>
  );
}
