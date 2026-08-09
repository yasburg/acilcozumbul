"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavSayacRozet,
  type PanelNavSayac,
} from "@/hooks/usePanelNavSayac";
import type { PanelRol } from "@/lib/panel-yetki";

const LINKS: {
  href: string;
  label: string;
  exact?: boolean;
  sayac?: "cekici" | "rozet" | "profilFoto" | "talep";
  roller: PanelRol[];
}[] = [
  { href: "/panel", label: "Özet", exact: true, roller: ["admin"] },
  {
    href: "/panel/cekiciler",
    label: "Çekiciler",
    sayac: "cekici",
    roller: ["admin"],
  },
  {
    href: "/panel/rozetler",
    label: "Rozetler",
    sayac: "rozet",
    roller: ["admin"],
  },
  {
    href: "/panel/profil-fotograflari",
    label: "Profil fotoğrafları",
    sayac: "profilFoto",
    roller: ["admin"],
  },
  {
    href: "/panel/talepler",
    label: "Talepler",
    sayac: "talep",
    roller: ["admin"],
  },
  { href: "/panel/talep-analiz", label: "Talep analizi", roller: ["admin"] },
  { href: "/panel/simulasyon", label: "Simülasyon", roller: ["admin"] },
  {
    href: "/panel/sms",
    label: "SMS Sağlık",
    exact: true,
    roller: ["admin"],
  },
  { href: "/panel/sms/toplu", label: "Toplu SMS", roller: ["admin"] },
  { href: "/panel/sms/sablonlar", label: "SMS şablonları", roller: ["admin"] },
  { href: "/panel/kredi-takip", label: "Kredi takip", roller: ["admin"] },
  {
    href: "/panel/kredi-dagitim",
    label: "Kredi dağıtım",
    roller: ["admin"],
  },
  { href: "/panel/kurulum-sms", label: "Kurulum takip", roller: ["admin"] },
  { href: "/panel/sehir-acilis", label: "Şehir açılış", roller: ["admin"] },
  {
    href: "/panel/kredi-odemeler",
    label: "Satın almalar",
    roller: ["admin", "muhasebe"],
  },
  {
    href: "/panel/faturalar",
    label: "Faturalar",
    roller: ["admin", "muhasebe"],
  },
  {
    href: "/panel/degerlendirmeler",
    label: "Değerlendirmeler",
    roller: ["admin"],
  },
  { href: "/panel/davetler", label: "Davet kodları", roller: ["admin"] },
  { href: "/panel/demo", label: "Demo", roller: ["admin"] },
  { href: "/panel/kampanyalar", label: "Kampanyalar", roller: ["admin"] },
  { href: "/panel/kayit-funnels", label: "Kayıt funnels", roller: ["admin"] },
  {
    href: "/panel/musteri-funnels",
    label: "Müşteri funnels",
    roller: ["admin"],
  },
  { href: "/panel/link-haritasi", label: "Link haritası", roller: ["admin"] },
];

function sayacDeger(
  tip: "cekici" | "rozet" | "profilFoto" | "talep" | undefined,
  sayac: PanelNavSayac | null
): number | undefined {
  if (!tip || !sayac) return undefined;
  if (tip === "cekici") return sayac.cekiciSayisi;
  if (tip === "rozet") return sayac.rozetTalepSayisi;
  if (tip === "profilFoto") return sayac.profilFotoTalepSayisi;
  return sayac.talepSayisi;
}

export function PanelNav({
  onCikis,
  sayac,
  rol = "admin",
}: {
  onCikis?: () => void;
  sayac?: PanelNavSayac | null;
  rol?: PanelRol;
}) {
  const pathname = usePathname();
  const linkler = LINKS.filter((l) => l.roller.includes(rol));

  return (
    <nav className="flex flex-col gap-1 p-3">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {rol === "muhasebe" ? "Muhasebe" : "Yönetim"}
      </p>
      {linkler.map(({ href, label, exact, sayac: tip }) => {
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
      {rol === "admin" && (
        <>
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
        </>
      )}
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
