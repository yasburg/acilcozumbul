import Link from "next/link";
import { BrandLogoYazili } from "@/components/BrandLogo";

interface MobileShellProps {
  children: React.ReactNode;
  subtitle?: string;
  /** Müşteri akışında sağ; çekici panelinde varsayılan orta */
  subtitleAlign?: "center" | "right";
  /** Logo sola (varsayılan) veya sağa */
  brandAlign?: "left" | "right";
  showBrand?: boolean;
  backHref?: string;
  /** Geri butonu metni (ör. Geri). Verilmezse yalnız ← ikonu */
  backLabel?: string;
  /** Sol üst geri: amber chip yerine soluk gri metin */
  backMuted?: boolean;
  /** Sayfa içi geri (href yerine); wizard adımları için */
  onBack?: () => void;
  /** Header ortasında, subtitle üstünde (ör. demo ikonu) */
  headerBadge?: React.ReactNode;
  /** Logo sağdayken Geri ile logo arasında (ör. online + progress) */
  headerCenter?: React.ReactNode;
  /** Logo tıklanınca (ör. wizard’ı ilk adıma al) */
  onBrandClick?: () => void;
  /** Logo sağında küçük aksiyon (ör. Giriş) */
  headerEnd?: React.ReactNode;
  /** Ana satırın altında tam genişlik (ör. progress bar) */
  headerBottom?: React.ReactNode;
  /** İlk ekranda daha alçak header */
  headerCompact?: boolean;
  /** Sticky header’ı tamamen gizle (ör. müşteri acil akış) */
  hideHeader?: boolean;
  /** 100dvh kilit — sayfa scroll’u yok (acil talep akışı) */
  lockViewport?: boolean;
  /** Shell arka planı */
  shellClassName?: string;
  footer?: React.ReactNode;
  /** Sticky alt nav varken footer’ın altında boşluk (ör. pb-24 / pb-44) */
  footerClassName?: string;
}

export function MobileShell({
  children,
  subtitle,
  subtitleAlign = "center",
  brandAlign = "left",
  showBrand = true,
  backHref,
  backLabel,
  backMuted = false,
  onBack,
  headerBadge,
  headerCenter,
  onBrandClick,
  headerEnd,
  headerBottom,
  headerCompact = false,
  hideHeader = false,
  lockViewport = false,
  shellClassName = "",
  footer,
  footerClassName,
}: MobileShellProps) {
  const geriMetinli = Boolean(backLabel);
  const geriSinif = backMuted
    ? `flex shrink-0 items-center justify-center gap-1 touch-manipulation text-slate-400 hover:text-slate-500 ${
        geriMetinli
          ? "px-1 py-2 text-sm font-medium"
          : "h-9 w-9 text-lg font-semibold"
      }`
    : `flex shrink-0 items-center justify-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300/80 touch-manipulation font-semibold shadow-sm shadow-amber-500/10 ${
        geriMetinli ? "px-3.5 py-2 text-sm" : "h-9 w-9 text-lg"
      }`;
  const geriAria = backLabel ?? "Geri";
  const geriIcerik = geriMetinli ? (
    <span>{backLabel}</span>
  ) : (
    <span aria-hidden>←</span>
  );

  const geriDugmesi = onBack ? (
    <button
      type="button"
      onClick={onBack}
      className={geriSinif}
      aria-label={geriAria}
    >
      {geriIcerik}
    </button>
  ) : backHref ? (
    <Link href={backHref} className={geriSinif} aria-label={geriAria}>
      {geriIcerik}
    </Link>
  ) : null;

  const logo = showBrand ? (
    <BrandLogoYazili
      priority
      onClick={
        onBrandClick
          ? () => {
              onBrandClick();
            }
          : undefined
      }
      className={`w-auto shrink-0 object-contain ${
        brandAlign === "right"
          ? "h-[3.9rem] max-w-[min(280px,70vw)] object-right"
          : headerCompact || headerEnd
            ? "h-9 max-w-[min(140px,42vw)] object-left"
            : "h-12 max-w-[min(200px,55vw)] object-left"
      }`}
    />
  ) : null;

  const logoSagda = brandAlign === "right";

  return (
    <div
      className={[
        "flex flex-col bg-white text-[var(--acb-dark)]",
        lockViewport
          ? "h-dvh max-h-dvh overflow-hidden"
          : "min-h-dvh",
        shellClassName,
      ].join(" ")}
    >
      {hideHeader ? null : (
      <header
        id="app-shell-header"
        className={[
          "acb-chrome-bar sticky top-0 z-30",
          headerCompact ? "px-3 py-1.5" : "px-3 py-2",
        ].join(" ")}
      >
        {logoSagda ? (
          <div className="flex min-h-[3.9rem] items-center gap-2 max-w-lg mx-auto">
            <div className="shrink-0">{geriDugmesi}</div>
            <div className="min-w-0 flex-1 flex flex-col items-stretch justify-center px-1">
              {headerCenter ??
                (subtitle ? (
                  <p className="min-w-0 text-[14.3px] leading-snug font-medium text-slate-600 line-clamp-3 text-center">
                    {subtitle}
                  </p>
                ) : null)}
            </div>
            {headerBadge}
            {headerEnd ? (
              <div className="relative z-10 shrink-0 flex items-center gap-2">
                {headerEnd}
              </div>
            ) : null}
            <div className="shrink-0">{logo}</div>
          </div>
        ) : (
          <div
            className={[
              "relative flex items-center max-w-lg mx-auto",
              headerCompact ? "min-h-9" : "min-h-[3.25rem]",
              subtitleAlign === "right" || headerEnd
                ? "justify-between gap-2"
                : "",
            ].join(" ")}
          >
            <div
              className={[
                "flex items-center gap-1.5",
                "relative z-10 shrink-0",
              ].join(" ")}
            >
              {geriDugmesi}
              {logo}
            </div>
            {headerEnd ? (
              <>
                {(headerBadge ||
                  (subtitle && subtitleAlign !== "right")) && (
                  <div className="min-w-0 flex-1 flex flex-col items-center justify-center gap-0.5 px-1">
                    {headerBadge ? (
                      <div className="w-full max-w-[11rem] sm:max-w-[14rem]">
                        {headerBadge}
                      </div>
                    ) : null}
                    {subtitle && subtitleAlign !== "right" ? (
                      <p className="text-[14.3px] leading-snug font-medium text-slate-600 line-clamp-3 text-center">
                        {subtitle}
                      </p>
                    ) : null}
                  </div>
                )}
                <div className="relative z-10 shrink-0 flex items-center gap-2">
                  {headerEnd}
                </div>
              </>
            ) : (
              <>
                {(headerBadge ||
                  (subtitle && subtitleAlign !== "right")) && (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-[5.75rem] sm:px-28">
                    {headerBadge ? (
                      <div className="pointer-events-auto w-full max-w-[13.5rem] sm:max-w-[15rem]">
                        {headerBadge}
                      </div>
                    ) : null}
                    {subtitle && subtitleAlign !== "right" ? (
                      <p className="text-[14.3px] leading-snug font-medium text-slate-600 line-clamp-3 text-center">
                        {subtitle}
                      </p>
                    ) : null}
                  </div>
                )}
                {subtitle && subtitleAlign === "right" && (
                  <p className="max-w-[46%] shrink-0 text-right text-[14.3px] leading-snug font-medium text-slate-600 line-clamp-3">
                    {subtitle}
                  </p>
                )}
              </>
            )}
          </div>
        )}
        {headerBottom ? (
          <div className="max-w-lg mx-auto w-full pt-1.5">{headerBottom}</div>
        ) : null}
      </header>
      )}
      <main
        className={[
          "flex-1 w-full",
          lockViewport
            ? `min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-contain ${
                hideHeader
                  ? "pt-[calc(1.5rem+env(safe-area-inset-top))]"
                  : "pt-4"
              } pb-[max(1rem,var(--acil-sticky-cta-h,5.5rem))] [-webkit-overflow-scrolling:touch]`
            : [
                hideHeader ? "pt-0" : "",
                headerCompact ? "py-3" : hideHeader ? "pb-5" : "py-5",
                "pb-24",
              ]
                .filter(Boolean)
                .join(" "),
        ].join(" ")}
      >
        {/* Content column stays max-w-lg; scroll surface is full-width so edges scroll too */}
        <div className="mx-auto w-full max-w-lg px-4">{children}</div>
      </main>
      {footer ? (
        <div className={footerClassName}>{footer}</div>
      ) : null}
    </div>
  );
}
