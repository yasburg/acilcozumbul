"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavSayacRozet,
  type PanelNavSayac,
} from "@/hooks/usePanelNavSayac";

const LINKS: {
  href: string;
  label: string;
  exact?: boolean;
  sayac?: "cekici" | "rozet" | "talep";
}[] = [
  { href: "/panel", label: "Özet", exact: true },
  { href: "/panel/cekiciler", label: "Çekiciler", sayac: "cekici" },
  { href: "/panel/rozetler", label: "Rozetler", sayac: "rozet" },
  { href: "/panel/talepler", label: "Talepler", sayac: "talep" },
  { href: "/panel/sms", label: "SMS Sağlık", exact: true },
  { href: "/panel/sms/toplu", label: "Toplu SMS" },
  { href: "/panel/sms/sablonlar", label: "SMS şablonları" },
  { href: "/panel/kredi-takip", label: "Kredi takip" },
  { href: "/panel/kurulum-sms", label: "Kurulum takip" },
  { href: "/panel/sehir-acilis", label: "Şehir açılış" },
  { href: "/panel/kredi-odemeler", label: "Kredi ödemeleri" },
  { href: "/panel/degerlendirmeler", label: "Değerlendirmeler" },
  { href: "/panel/davetler", label: "Davet kodları" },
  { href: "/panel/demo", label: "Demo" },
  { href: "/panel/kampanyalar", label: "Kampanyalar" },
  { href: "/panel/kayit-funnels", label: "Kayıt funnels" },
  { href: "/panel/link-haritasi", label: "Link haritası" },
];

function sayacDeger(
  tip: "cekici" | "rozet" | "talep" | undefined,
  sayac: PanelNavSayac | null
): number | undefined {
  if (!tip || !sayac) return undefined;
  if (tip === "cekici") return sayac.cekiciSayisi;
  if (tip === "rozet") return sayac.rozetTalepSayisi;
  return sayac.talepSayisi;
}

export function PanelNav({
  onCikis,
  sayac,
}: {
  onCikis?: () => void;
  sayac?: PanelNavSayac | null;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-3">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Yönetim
      </p>
      {LINKS.map(({ href, label, exact, sayac: tip }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const adet = sayacDeger(tip, sayac ?? null);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition flex items-center justify-between gap-2 ${
              active
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span>{label}</span>
            <NavSayacRozet adet={adet} aktif={active} />
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
        href="/kayit/b"
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
