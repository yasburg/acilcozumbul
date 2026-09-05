import Link from "next/link";
import { kayitFunnelYolu } from "@/lib/kayit-funnel";

/** Ana sayfa — hizmet veren kayıt CTA (Görselsiz şık, dengeli 2-sütunlu/esnek kart) */
export function AnaSayfaHizmetVerCta() {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 md:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="max-w-2xl space-y-2.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-[1.18]">
            Kazanan işletmeler arasına siz de katılın
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600">
            %100 iş fırsatı ile siz de yeni müşteriler kazanın.{" "}
            <strong className="font-semibold text-slate-800">
              Çekici, lastikçi, akü takviyesi, oto anahtarcı
            </strong>{" "}
            ve{" "}
            <strong className="font-semibold text-slate-800">yakıt yardımı</strong>{" "}
            sektörlerine hizmet veriyorsanız en uygun koşullarla kazanmaya
            başlayın!
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3.5 sm:flex-row sm:items-center md:flex-col md:items-end">
          <Link
            href={kayitFunnelYolu("c")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#9ee3b2] bg-[#eaf8ee] px-6 py-3.5 text-sm sm:text-base font-bold text-[#0b4e1e] shadow-[0_2px_8px_rgba(8,155,45,0.08)] transition-all duration-200 hover:border-[#089b2d] hover:bg-[#d5f3dc] hover:shadow-[0_4px_12px_rgba(8,155,45,0.16)] active:scale-[0.98] touch-manipulation"
          >
            <span className="inline-flex size-5 items-center justify-center text-[#089b2d]" aria-hidden>
              <svg viewBox="0 0 24 24" className="size-5" fill="none">
                <path
                  d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M4.5 20.2a7.5 7.5 0 0 1 15 0"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M18.5 8v4M16.5 10h4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Hizmet ver
          </Link>
          <Link
            href="/cekici/giris"
            className="text-xs sm:text-sm font-semibold text-slate-900 underline underline-offset-4 transition-colors hover:text-slate-600 touch-manipulation"
          >
            Zaten hesabınız var mı? Giriş yapın
          </Link>
        </div>
      </div>
    </section>
  );
}
