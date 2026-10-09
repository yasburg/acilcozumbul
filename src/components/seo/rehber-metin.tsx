import Link from "next/link";
import type { ReactNode } from "react";

/** Paragraf içi `[metin](/yol)` markdown linklerini gerçek <Link> yapar. */
export function rehberMetinLinkli(metin: string): ReactNode[] {
  const re = /\[([^\]]+)\]\((\/[^)]+)\)/g;
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(metin)) !== null) {
    if (m.index > last) out.push(metin.slice(last, m.index));
    out.push(
      <Link
        key={`l-${i++}`}
        href={m[2]}
        className="font-medium text-slate-900 underline underline-offset-2 decoration-slate-300 hover:decoration-amber-500"
      >
        {m[1]}
      </Link>
    );
    last = m.index + m[0].length;
  }
  if (last < metin.length) out.push(metin.slice(last));
  return out;
}
