import Link from "next/link";
import { YASAL_LINKLER } from "@/lib/yasal-sirket";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  invalid?: boolean;
  /** müşteri | hizmet-veren */
  rol?: "musteri" | "hizmet-veren";
};

export function YasalOnayKutusu({
  checked,
  onChange,
  disabled = false,
  invalid = false,
  rol = "musteri",
}: Props) {
  const rolMetin =
    rol === "hizmet-veren"
      ? "Hizmet veren (çekici, lastikçi, anahtarcı) olarak"
      : "Müşteri olarak";

  return (
    <label
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer ${
        disabled
          ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
          : invalid
            ? "border-red-500 bg-red-50/50 ring-2 ring-red-200"
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
        className="mt-1 rounded border-slate-300 text-amber-600"
        aria-describedby="yasal-onay-aciklama"
      />
      <span id="yasal-onay-aciklama" className="text-sm text-slate-700 leading-relaxed">
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
