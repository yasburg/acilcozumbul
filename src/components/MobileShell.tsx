import Link from "next/link";

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
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {backHref && (
            <Link
              href={backHref}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-700"
              aria-label="Geri"
            >
              ←
            </Link>
          )}
          {showBrand && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-600 tracking-wide uppercase">
                Acil Çözüm Bul
              </p>
              <h1 className="text-lg font-bold truncate text-slate-900">
                acilcozumbul.com
              </h1>
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">{subtitle}</p>
        )}
      </header>
      <main className="flex-1 px-4 py-5 pb-24 max-w-lg mx-auto w-full">{children}</main>
      {footer}
    </div>
  );
}
