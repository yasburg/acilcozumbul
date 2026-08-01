"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogoYazili } from "@/components/BrandLogo";
import { PanelNav } from "@/components/PanelNav";
import { NavSayacRozet, usePanelNavSayac } from "@/hooks/usePanelNavSayac";

function MobilNavLink({
  href,
  label,
  adet,
}: {
  href: string;
  label: string;
  adet?: number;
}) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap rounded-lg bg-slate-100 px-3 py-1.5 inline-flex items-center"
    >
      {label}
      <NavSayacRozet adet={adet} aktif={false} />
    </Link>
  );
}

export function PanelChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [panelYetkili, setPanelYetkili] = useState<boolean | null>(null);
  const chromeAcik =
    pathname !== "/panel/giris" &&
    !(pathname === "/panel" && panelYetkili !== true);
  const sayac = usePanelNavSayac(chromeAcik && panelYetkili === true);

  useEffect(() => {
    let iptal = false;
    void fetch("/api/panel/oturum", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { yetkili: false }))
      .then((d) => {
        if (!iptal) setPanelYetkili(!!d.yetkili);
      })
      .catch(() => {
        if (!iptal) setPanelYetkili(false);
      });
    return () => {
      iptal = true;
    };
  }, [pathname]);

  if (
    pathname === "/panel/giris" ||
    (pathname === "/panel" && panelYetkili !== true)
  ) {
    return <>{children}</>;
  }

  async function cikis() {
    await fetch("/api/panel/cikis", { method: "POST" });
    router.replace("/panel");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <Link href="/panel" className="block">
            <BrandLogoYazili
              href={null}
              className="h-7 w-auto max-w-[180px] object-contain object-left"
            />
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
      <div className="flex w-full max-w-none gap-0 lg:gap-6 lg:p-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-6 flex max-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="shrink-0 border-b border-slate-100 px-4 py-4 space-y-2">
              <BrandLogoYazili
                href={null}
                className="h-8 w-auto max-w-full object-contain object-left"
              />
              <h1 className="text-sm font-semibold text-slate-600">
                Yönetim Paneli
              </h1>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <PanelNav onCikis={() => void cikis()} sayac={sayac} />
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden overflow-x-auto">
            <div className="flex gap-2 text-sm">
              <MobilNavLink href="/panel" label="Özet" />
              <MobilNavLink
                href="/panel/cekiciler"
                label="Çekiciler"
                adet={sayac?.cekiciSayisi}
              />
              <MobilNavLink
                href="/panel/rozetler"
                label="Rozetler"
                adet={sayac?.rozetTalepSayisi}
              />
              <MobilNavLink
                href="/panel/profil-fotograflari"
                label="Profil foto"
                adet={sayac?.profilFotoTalepSayisi}
              />
              <MobilNavLink
                href="/panel/talepler"
                label="Talepler"
                adet={sayac?.talepSayisi}
              />
              <MobilNavLink href="/panel/sms" label="SMS Sağlık" />
              <MobilNavLink href="/panel/sms/toplu" label="Toplu SMS" />
              <MobilNavLink href="/panel/sms/sablonlar" label="SMS şablonları" />
              <MobilNavLink href="/panel/kredi-takip" label="Kredi takip" />
              <MobilNavLink href="/panel/kurulum-sms" label="Kurulum takip" />
              <MobilNavLink href="/panel/sehir-acilis" label="Şehir açılış" />
              <MobilNavLink
                href="/panel/kredi-odemeler"
                label="Kredi ödemeleri"
              />
              <MobilNavLink href="/panel/degerlendirmeler" label="Puanlar" />
              <MobilNavLink href="/panel/davetler" label="Davet" />
              <MobilNavLink href="/panel/demo" label="Demo" />
              <MobilNavLink href="/panel/kampanyalar" label="Kampanya" />
              <MobilNavLink href="/panel/kayit-funnels" label="Kayıt funnels" />
              <MobilNavLink href="/panel/link-haritasi" label="Link haritası" />
            </div>
          </div>
          <div className="p-4 lg:p-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
