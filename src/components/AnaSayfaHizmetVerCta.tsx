import Link from "next/link";
import { kayitFunnelYolu } from "@/lib/kayit-funnel";

/** Ana sayfa — hizmet veren kayıt CTA (funnel b) */
export function AnaSayfaHizmetVerCta() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-4">
      <div className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-lg font-bold leading-snug tracking-tight text-slate-900">
            Kazanan işletmeler arasına siz de katılın
          </h2>
          <p className="text-sm leading-snug text-slate-600">
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
        <Link
          href={kayitFunnelYolu("b")}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm shadow-amber-500/25 transition touch-manipulation hover:bg-amber-600 active:scale-[0.98]"
        >
          <span className="inline-flex size-5 items-center justify-center" aria-hidden>
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
          Hizmet Ver
        </Link>
      </div>
    </section>
  );
}
