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
  /** İlk ekranda daha alçak header */
  headerCompact?: boolean;
  footer?: React.ReactNode;
}

export function MobileShell({
  children,
  subtitle,
  subtitleAlign = "center",
  brandAlign = "left",
  showBrand = true,
  backHref,
  backLabel,
  onBack,
  headerBadge,
  headerCenter,
  onBrandClick,
  headerEnd,
  headerCompact = false,
  footer,
}: MobileShellProps) {
  const geriMetinli = Boolean(backLabel);
  const geriSinif = `flex shrink-0 items-center justify-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300/80 touch-manipulation font-semibold shadow-sm shadow-amber-500/10 ${
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
          : headerCompact
            ? "h-9 max-w-[min(160px,48vw)] object-left"
            : "h-12 max-w-[min(200px,55vw)] object-left"
      }`}
    />
  ) : null;

  const logoSagda = brandAlign === "right";

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 text-slate-900">
      <header
        id="app-shell-header"
        className={[
          "sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm",
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
            <div className="shrink-0">{logo}</div>
          </div>
        ) : (
          <div
            className={[
              "flex items-center max-w-lg mx-auto",
              headerCompact ? "min-h-9" : "min-h-[3.9rem]",
              subtitleAlign === "right"
                ? "justify-between gap-2"
                : "relative",
            ].join(" ")}
          >
            <div
              className={[
                "flex items-center gap-1.5",
                subtitleAlign === "center"
                  ? "relative z-10"
                  : "min-w-0 shrink-0",
              ].join(" ")}
            >
              {geriDugmesi}
              {logo}
            </div>
            {subtitle && subtitleAlign !== "right" && (
              <div className="pointer-events-none absolute inset-x-0 flex flex-col items-center justify-center gap-0.5 px-24 sm:px-28">
                {headerBadge}
                <p className="text-[14.3px] leading-snug font-medium text-slate-600 line-clamp-3 text-center">
                  {subtitle}
                </p>
              </div>
            )}
            {!subtitle && headerBadge && subtitleAlign === "center" && (
              <div className="pointer-events-none absolute inset-x-0 flex justify-center px-24 sm:px-28">
                {headerBadge}
              </div>
            )}
            {subtitle && subtitleAlign === "right" && !headerEnd && (
              <p className="max-w-[46%] shrink-0 text-right text-[14.3px] leading-snug font-medium text-slate-600 line-clamp-3">
                {subtitle}
              </p>
            )}
            {headerEnd ? (
              <div className="relative z-10 ml-auto shrink-0 flex items-center gap-2">
                {headerEnd}
              </div>
            ) : null}
          </div>
        )}
      </header>
      <main
        className={[
          "flex-1 px-4 max-w-lg mx-auto w-full pb-24",
          headerCompact ? "py-3" : "py-5",
        ].join(" ")}
      >
        {children}
      </main>
      {footer}
    </div>
  );
}
