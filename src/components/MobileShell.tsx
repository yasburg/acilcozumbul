import Link from "next/link";
import { BrandLogoYazili } from "@/components/BrandLogo";

interface MobileShellProps {
  children: React.ReactNode;
  subtitle?: string;
  showBrand?: boolean;
  backHref?: string;
  footer?: React.ReactNode;
}

export function MobileShell({
  children,
  subtitle,
  showBrand = true,
  backHref,
  footer,
}: MobileShellProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 text-slate-900">
      <header
        id="app-shell-header"
        className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 shadow-sm"
      >
        <div className="relative flex min-h-[4.5rem] items-center justify-center max-w-lg mx-auto">
          {backHref && (
            <Link
              href={backHref}
              className="absolute left-0 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700"
              aria-label="Geri"
            >
              ←
            </Link>
          )}
          {showBrand && (
            <BrandLogoYazili
              priority
              className="h-[5.25rem] w-auto max-w-[min(480px,96vw)] object-contain object-center mx-auto"
            />
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto text-center">
            {subtitle}
          </p>
        )}
      </header>
      <main className="flex-1 px-4 py-5 pb-24 max-w-lg mx-auto w-full">{children}</main>
      {footer}
    </div>
  );
}
