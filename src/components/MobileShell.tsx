import Link from "next/link";
import { BrandLogoYazili } from "@/components/BrandLogo";

interface MobileShellProps {
  children: React.ReactNode;
  subtitle?: string;
  /** Müşteri akışında sağ; çekici panelinde varsayılan orta */
  subtitleAlign?: "center" | "right";
  showBrand?: boolean;
  backHref?: string;
  footer?: React.ReactNode;
}

export function MobileShell({
  children,
  subtitle,
  subtitleAlign = "center",
  showBrand = true,
  backHref,
  footer,
}: MobileShellProps) {
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
            {backHref && (
              <Link
                href={backHref}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base text-slate-700"
                aria-label="Geri"
              >
                ←
              </Link>
            )}
            {showBrand && (
              <BrandLogoYazili
                priority
                className="h-[3.9rem] w-auto max-w-[min(312px,82vw)] shrink-0 object-contain object-left"
              />
            )}
          </div>
          {subtitle && (
            <p
              className={[
                "text-[14.3px] leading-snug font-medium text-slate-600 line-clamp-3",
                subtitleAlign === "right"
                  ? "max-w-[46%] shrink-0 text-right"
                  : "pointer-events-none absolute inset-x-0 px-28 text-center",
              ].join(" ")}
            >
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
