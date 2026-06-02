"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: { href: string; label: string; exact?: boolean }[] = [
  { href: "/panel", label: "Özet", exact: true },
  { href: "/panel/cekiciler", label: "Çekiciler" },
  { href: "/panel/talepler", label: "Talepler" },
  { href: "/panel/sms", label: "SMS" },
  { href: "/panel/kredi-odemeler", label: "Kredi ödemeleri" },
  { href: "/panel/degerlendirmeler", label: "Değerlendirmeler" },
];

export function PanelNav({ onCikis }: { onCikis?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Yönetim
      </p>
      {LINKS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {label}
          </Link>
        );
      })}
      <div className="my-2 border-t border-slate-200" />
      <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Site
      </p>
      <Link
        href="/"
        className="rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
      >
        Ana sayfa
      </Link>
      <Link
        href="/cekici/kayit"
        className="rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
      >
        Çekici kayıt
      </Link>
      <Link
        href="/cekici/giris"
        className="rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
      >
        Çekici giriş
      </Link>
      {onCikis && (
        <>
          <div className="my-2 border-t border-slate-200" />
          <button
            type="button"
            onClick={onCikis}
            className="rounded-xl px-3 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 w-full"
          >
            Çıkış yap
          </button>
        </>
      )}
    </nav>
  );
}
