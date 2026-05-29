import Link from "next/link";
import { PanelNav } from "@/components/PanelNav";

export const metadata = {
  title: "Yönetim Paneli | acilcozumbul.com",
};

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/panel" className="font-bold text-amber-600">
          acilcozumbul — Panel
        </Link>
      </header>
      <div className="mx-auto flex max-w-6xl gap-0 lg:gap-6 lg:p-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-4">
              <p className="text-xs font-semibold text-amber-600 uppercase">
                acilcozumbul.com
              </p>
              <h1 className="text-lg font-bold">Yönetim Paneli</h1>
            </div>
            <PanelNav />
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden overflow-x-auto">
            <div className="flex gap-2 text-sm">
              <Link href="/panel" className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5">
                Özet
              </Link>
              <Link href="/panel/cekiciler" className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5">
                Çekiciler
              </Link>
              <Link href="/panel/talepler" className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5">
                Talepler
              </Link>
              <Link href="/panel/sms" className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5">
                SMS
              </Link>
            </div>
          </div>
          <div className="p-4 lg:p-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
