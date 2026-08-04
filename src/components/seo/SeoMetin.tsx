import Link from "next/link";
import type { ReactNode } from "react";

export type SeoMetinBaglanti = { ad: string; href: string };

/**
 * Metindeki şehir / ilçe adlarını <a> ile sarar.
 * href’ler yayın planına göre verilir; henüz sayfa yoksa da iskelet kalır.
 */
export function SeoMetin({
  metin,
  baglantilar,
  className,
  inline = false,
}: {
  metin: string;
  baglantilar: SeoMetinBaglanti[];
  className?: string;
  /** li içinde kullanım için span */
  inline?: boolean;
}) {
  const cocuklar = metinParcala(metin, baglantilar);
  if (inline) {
    return <span className={className}>{cocuklar}</span>;
  }
  return <p className={className}>{cocuklar}</p>;
}

export function metinParcala(
  metin: string,
  baglantilar: SeoMetinBaglanti[]
): ReactNode[] {
  const tekil = new Map<string, string>();
  for (const b of baglantilar) {
    const ad = b.ad.trim();
    if (!ad || !b.href) continue;
    if (!tekil.has(ad)) tekil.set(ad, b.href);
  }
  const adlar = [...tekil.keys()].sort((a, b) => b.length - a.length);
  if (adlar.length === 0) return [metin];

  const kacis = adlar.map(regexKacis).join("|");
  const re = new RegExp(`(${kacis})`, "g");
  const parcalar = metin.split(re);

  return parcalar.map((parca, i) => {
    const href = tekil.get(parca);
    if (!href) return <span key={`${i}-${parca.slice(0, 12)}`}>{parca}</span>;
    return (
      <Link
        key={`${i}-${parca}`}
        href={href}
        className="font-medium text-amber-800 underline decoration-amber-300/80 underline-offset-2 hover:text-amber-950 hover:decoration-amber-500"
      >
        {parca}
      </Link>
    );
  });
}

function regexKacis(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
