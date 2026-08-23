import Link from "next/link";
import { YASAL_LINKLER } from "@/lib/yasal-sirket";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  invalid?: boolean;
  /** müşteri | hizmet-veren */
  rol?: "musteri" | "hizmet-veren";
  /** Daha küçük metin (kayıt formları) */
  kucukMetin?: boolean;
};

export function YasalOnayKutusu({
  checked,
  onChange,
  disabled = false,
  invalid = false,
  rol = "musteri",
  kucukMetin = false,
}: Props) {
  const rolMetin =
    rol === "hizmet-veren"
      ? "Hizmet veren olarak"
      : "Müşteri olarak";

  return (
    <label
      className={`group flex items-start gap-3 rounded-2xl border cursor-pointer select-none touch-manipulation transition-all duration-150 active:scale-[0.99] ${
        kucukMetin ? "p-3.5" : "p-4"
      } ${
        disabled
          ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
          : invalid
            ? "border-red-400 bg-red-50/70 ring-2 ring-red-300 shadow-[0_0_0_3px_rgba(248,113,113,0.15)] animate-pulse"
            : checked
              ? "border-[#9ee3b2] bg-[#eaf8ee] shadow-[0_2px_10px_rgba(8,155,45,0.1)]"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-sm"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
        aria-describedby="yasal-onay-aciklama"
      />

      {/* Büyük Dokunmatik Checkbox Göstergesi */}
      <div
        className={`size-5.5 sm:size-6 shrink-0 rounded-lg flex items-center justify-center transition-all duration-150 mt-0.5 ${
          checked
            ? "bg-[var(--acb-green)] text-white shadow-sm ring-2 ring-[var(--acb-green)]/20"
            : invalid
              ? "border-2 border-red-500 bg-white"
              : "border-2 border-slate-300 bg-white group-hover:border-slate-400"
        }`}
        aria-hidden="true"
      >
        {checked && (
          <svg
            className="size-3.5 sm:size-4 stroke-[3] text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      <span
        id="yasal-onay-aciklama"
        className={`flex-1 text-slate-700 leading-snug ${
          kucukMetin ? "text-[13px] sm:text-[13.5px]" : "text-[13.5px] sm:text-[14px] leading-relaxed"
        }`}
      >
        {rolMetin}{" "}
        {YASAL_LINKLER.map((l, i) => (
          <span key={l.href}>
            {i > 0 && (i === YASAL_LINKLER.length - 1 ? " ve " : ", ")}
            <Link
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-emerald-800 underline underline-offset-2 font-semibold hover:text-emerald-950 active:text-emerald-900"
            >
              {l.label.replace(" (KVKK)", "")}
            </Link>
          </span>
        ))}
        {" "}
        metinlerini okudum, kabul ediyorum; kampanya SMS’i dahil ticari
        elektronik ileti almaya onay veriyorum.
      </span>
    </label>
  );
}
