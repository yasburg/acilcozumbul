import Link from "next/link";
import { YASAL_LINKLER } from "@/lib/yasal-sirket";

export function YasalSiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-4 mt-auto">
      <nav
        className="max-w-lg mx-auto flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-500"
        aria-label="Yasal metinler"
      >
        {YASAL_LINKLER.map((l, i) => (
          <span key={l.href} className="inline-flex items-center gap-3">
            {i > 0 && <span className="text-slate-300" aria-hidden>|</span>}
            <Link href={l.href} className="hover:text-amber-700 underline-offset-2 hover:underline">
              {l.label.replace(" (KVKK)", "")}
            </Link>
          </span>
        ))}
      </nav>
    </footer>
  );
}
