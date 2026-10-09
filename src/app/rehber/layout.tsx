import Link from "next/link";
import { BrandLogoYazili } from "@/components/BrandLogo";
import { RehberYukariGit } from "@/components/seo/RehberYukariGit";
import { YasalSiteFooter } from "@/components/yasal/YasalSiteFooter";

export default function RehberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur px-4 py-3">
        <div className="mx-auto grid max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Link
            href="/"
            className="justify-self-start text-sm font-medium text-amber-700 hover:text-amber-800"
          >
            ← Ana sayfa
          </Link>
          <BrandLogoYazili
            priority
            className="h-8 w-auto max-w-[160px] object-contain sm:h-9 sm:max-w-[200px]"
          />
          {/* Sağ kolon: logo gerçekten ortada kalsın */}
          <span aria-hidden className="block" />
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <YasalSiteFooter />
      <RehberYukariGit />
    </div>
  );
}
