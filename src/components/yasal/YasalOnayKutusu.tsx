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

  const paylasimMetin =
    rol === "hizmet-veren"
      ? "telefon numaramın, profil bilgilerimin ve puanımın müşterilerle; müşteri telefon ve talep bilgilerinin de benimle paylaşılmasını"
      : "telefon numaramın ve talepte verdiğim bilgilerin hizmet verenlerle; hizmet verenin telefon, profil ve puan bilgilerinin de benimle paylaşılmasını";

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
        {rolMetin} aşağıdaki metinleri okudum, kabul ediyorum; {paylasimMetin};
        hizmet için SMS ve sabit hat üzerinden sesli mesaj/arama
        yapılabileceğini; kampanya ve bilgilendirme amaçlı ticari elektronik
        ileti (SMS) gönderilmesine 6563 sayılı Kanun kapsamında onay verdiğimi
        kabul ederim:{" "}
        {YASAL_LINKLER.map((l, i) => (
          <span key={l.href}>
            {i > 0 && (i === YASAL_LINKLER.length - 1 ? " ve " : ", ")}
            <Link href={l.href} className="text-amber-700 underline font-medium">
              {l.label.replace(" (KVKK)", "")}
            </Link>
          </span>
        ))}
        . Ticari ileti onayımı dilediğim zaman geri alabilirim.
      </span>
    </label>
  );
}
