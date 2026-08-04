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
      ? "Hizmet veren (çekici, lastikçi, anahtarcı) olarak"
      : "Müşteri olarak";

  return (
    <label
      className={`flex items-start gap-2.5 rounded-xl border cursor-pointer ${
        kucukMetin ? "px-3 py-2" : "px-4 py-3 gap-3"
      } ${
        disabled
          ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
          : invalid
            ? "border-red-500 bg-red-50/50 ring-2 ring-red-300 shadow-[0_0_0_4px_rgba(248,113,113,0.25)] animate-pulse"
            : checked
              ? "border-amber-300 bg-amber-50/50"
              : "border-slate-200 bg-white"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={`rounded border-slate-300 text-amber-600 ${
          kucukMetin ? "mt-0.5 scale-90" : "mt-1"
        }`}
        aria-describedby="yasal-onay-aciklama"
      />
      <span
        id="yasal-onay-aciklama"
        className={`text-slate-700 leading-snug ${
          kucukMetin ? "text-[11px]" : "text-sm leading-relaxed"
        }`}
      >
        {rolMetin} Platformu kullanmak için aşağıdaki metinleri okudum ve kabul
        ediyorum:{" "}
        {YASAL_LINKLER.map((l, i) => (
          <span key={l.href}>
            {i > 0 && (i === YASAL_LINKLER.length - 1 ? " ve " : ", ")}
            <Link href={l.href} className="text-amber-700 underline font-medium">
              {l.label.replace(" (KVKK)", "")}
            </Link>
          </span>
        ))}
        .
      </span>
    </label>
  );
}
