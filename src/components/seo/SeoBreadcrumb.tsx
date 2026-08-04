import Link from "next/link";
import type { BreadcrumbOge } from "@/lib/seo-jsonld";

export function SeoBreadcrumb({ ogeler }: { ogeler: BreadcrumbOge[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {ogeler.map((o, i) => {
          const son = i === ogeler.length - 1;
          return (
            <li key={o.path} className="flex items-center gap-1.5">
              {i > 0 ? (
                <span className="text-slate-300" aria-hidden>
                  ›
                </span>
              ) : null}
              {son ? (
                <span className="text-slate-700 font-medium">{o.name}</span>
              ) : (
                <Link
                  href={o.path}
                  className="underline-offset-2 hover:underline"
                >
                  {o.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
