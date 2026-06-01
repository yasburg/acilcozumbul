"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogoYazili } from "@/components/BrandLogo";
import { PanelNav } from "@/components/PanelNav";

export function PanelChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/panel/giris") {
    return <>{children}</>;
  }

  async function cikis() {
    await fetch("/api/panel/cikis", { method: "POST" });
    router.replace("/cekici/giris?eposta=1");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <Link href="/panel" className="block">
            <BrandLogoYazili href={null} className="h-7 w-auto max-w-[180px] object-contain object-left" />
          </Link>
          <button
            type="button"
            onClick={() => void cikis()}
            className="text-sm text-slate-600"
          >
            Çıkış
          </button>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-0 lg:gap-6 lg:p-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-4 space-y-2">
              <BrandLogoYazili href={null} className="h-8 w-auto max-w-full object-contain object-left" />
              <h1 className="text-sm font-semibold text-slate-600">Yönetim Paneli</h1>
            </div>
            <PanelNav onCikis={() => void cikis()} />
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden overflow-x-auto">
            <div className="flex gap-2 text-sm">
              <Link
                href="/panel"
                className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5"
              >
                Özet
              </Link>
              <Link
                href="/panel/cekiciler"
                className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5"
              >
                Çekiciler
              </Link>
              <Link
                href="/panel/talepler"
                className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5"
              >
                Talepler
              </Link>
              <Link
                href="/panel/sms"
                className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5"
              >
                SMS
              </Link>
              <Link
                href="/panel/degerlendirmeler"
                className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5"
              >
                Puanlar
              </Link>
            </div>
          </div>
          <div className="p-4 lg:p-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
